-- canonical-plates.lua
--
-- Pandoc Lua filter: insert a full-page canonical plate immediately before
-- a heading whose text matches an editorial placement entry in
-- `canonical-plates.config.json`.
--
-- Architecture:
--   * Placement decisions live in JSON, not in this filter. Editorial
--     authority is sovereign; the filter is mechanical.
--   * Plate files live at /book-studio/figures/{plate}.png under repo root.
--   * If a plate file is absent on disk, the filter emits nothing for that
--     entry (silent reserve — sibling to the canvas + read-surface
--     missing-file behavior). No broken-image icon, no markup, no log.
--   * Matching is `startsWith` on the heading text (after Pandoc's plain-
--     text rendering of the heading inlines), so "Chapter 5:" matches
--     "Chapter 5: Fire" and any future subtitle of that chapter.
--
-- Output markup per matched threshold:
--   <div class="canonical-plate canonical-plate--{role}" data-plate="{plate}">
--     <img src="/book-studio/figures/{plate}.png" alt="{alt}" />
--   </div>
--
-- Both the print-book.css and epub-book.css define the threshold visual
-- treatment (full-page, centered, no caption, page-break before/after).
--
-- Usage: pandoc INPUT.md ... --lua-filter=lib/manuscript/render/canonical-plates.lua

local CONFIG_PATH = "lib/manuscript/render/canonical-plates.config.json"
local FIGURES_DIR = "public/book-studio/figures"

-- ---------------------------------------------------------------------------
-- Minimal JSON parser (Pandoc's pandoc.json was added in 3.0; we run on
-- production Pandoc 2.17, so we hand-parse the small flat config). Only
-- the subset we author is supported: objects, arrays, strings, no nested
-- objects beyond the threshold entries themselves.
-- ---------------------------------------------------------------------------

local function read_file(path)
  local f = io.open(path, "rb")
  if not f then return nil end
  local content = f:read("*a")
  f:close()
  return content
end

local function file_exists(path)
  local f = io.open(path, "rb")
  if not f then return false end
  f:close()
  return true
end

-- Strip C-style line comments and parse JSON via Pandoc's bundled parser
-- when available (Pandoc 3+). Fall back to a tiny ad-hoc parser for the
-- known shape on Pandoc 2.x.
local function parse_config(content)
  if not content then return nil end
  if pandoc and pandoc.json and pandoc.json.decode then
    local ok, decoded = pcall(pandoc.json.decode, content)
    if ok then return decoded end
  end
  -- Ad-hoc parser tuned to canonical-plates.config.json shape only.
  -- Extracts each `{...}` object inside the `thresholds` array and
  -- pulls plate / beforeHeading / alt / role from string fields.
  local thresholds = {}
  local arr = content:match('"thresholds"%s*:%s*%[(.-)%]')
  if not arr then return { thresholds = {} } end
  for obj in arr:gmatch("{(.-)}") do
    local function field(name)
      return obj:match('"' .. name .. '"%s*:%s*"(.-)"')
    end
    local plate = field("plate")
    local beforeHeading = field("beforeHeading")
    if plate and beforeHeading then
      table.insert(thresholds, {
        plate = plate,
        beforeHeading = beforeHeading,
        alt = field("alt") or "",
        role = field("role") or "threshold",
      })
    end
  end
  return { thresholds = thresholds }
end

-- ---------------------------------------------------------------------------
-- Load config + resolve which thresholds have available binaries
-- ---------------------------------------------------------------------------

local config = parse_config(read_file(CONFIG_PATH)) or { thresholds = {} }
local active = {}
for _, t in ipairs(config.thresholds or {}) do
  local file_path = FIGURES_DIR .. "/" .. t.plate .. ".png"
  if file_exists(file_path) then
    table.insert(active, t)
  end
  -- if absent: silent skip, no log, no markup
end

-- ---------------------------------------------------------------------------
-- Heading text extraction (pandoc.utils.stringify renders inlines to plain
-- text, which is what we match `beforeHeading` against)
-- ---------------------------------------------------------------------------

local stringify = (pandoc.utils and pandoc.utils.stringify) or function(x)
  if type(x) == "table" then
    local s = ""
    for _, el in ipairs(x.content or x) do
      if el.t == "Str" then s = s .. el.text
      elseif el.t == "Space" or el.t == "SoftBreak" then s = s .. " "
      end
    end
    return s
  end
  return tostring(x)
end

local function starts_with(s, prefix)
  if not s or not prefix then return false end
  return s:sub(1, #prefix) == prefix
end

local function match_threshold(heading_text)
  for _, t in ipairs(active) do
    if starts_with(heading_text, t.beforeHeading) then
      return t
    end
  end
  return nil
end

-- ---------------------------------------------------------------------------
-- Build the plate Block for a matched threshold
-- ---------------------------------------------------------------------------

local function build_plate_block(t)
  -- Relative path (no leading slash) so the URL resolves against the
  -- HTML wrapper's <base href="file://.../public/"> — see pagedPdf.ts.
  -- Absolute paths like "/book-studio/figures/..." are resolved by
  -- Chromium against the filesystem root in file:// context (NOT against
  -- <base href>), which fails with net::ERR_FILE_NOT_FOUND. Relative URLs
  -- are resolved against the base href as expected.
  local src = "book-studio/figures/" .. t.plate .. ".png"
  local img = pandoc.Image({ pandoc.Str("") }, src, "", pandoc.Attr("", { "canonical-plate-img" }, { { "alt", t.alt } }))
  -- Wrap the image in a paragraph so center-images.lua-equivalent CSS
  -- treatment can reach it via standard p > img selectors if needed.
  local p = pandoc.Para({ img })
  local classes = { "canonical-plate", "canonical-plate--" .. (t.role or "threshold") }
  return pandoc.Div(
    { p },
    pandoc.Attr("", classes, { { "data-plate", t.plate }, { "role", "img" }, { "aria-label", t.alt } })
  )
end

-- ---------------------------------------------------------------------------
-- Walk the document blocks and inject plates before matching headings.
-- Pandoc Block-list filters are how we insert siblings; we emit a list
-- containing [plate_block, original_header] when a header matches.
-- ---------------------------------------------------------------------------

-- Plates fire only on level-1 headings (chapter / part / front-matter
-- opener). Level-2+ headings (sub-sections, recap indices in the
-- appendix, etc.) never trigger a plate, even when their text matches
-- a `beforeHeading` prefix. The Elemental Alchemy appendix contains
-- a level-3 recap with `### Chapter 5: Fire` etc. — those must NOT
-- get plates re-inserted there.
function Blocks(blocks)
  if #active == 0 then return nil end
  local out = {}
  for _, b in ipairs(blocks) do
    if b.t == "Header" and b.level == 1 then
      local text = stringify(b.content or {})
      local matched = match_threshold(text)
      if matched then
        table.insert(out, build_plate_block(matched))
      end
    end
    table.insert(out, b)
  end
  return out
end
