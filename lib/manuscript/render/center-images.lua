-- center-images.lua
--
-- Pandoc Lua filter: wrap any paragraph whose only meaningful content is
-- a single Image in a <div class="image-block">. This gives a stable
-- container for CSS centering across renderers (Apple Books, Calibre,
-- print PDF) without depending on the :has() selector.
--
-- Usage:  pandoc INPUT.md -o OUT --lua-filter=center-images.lua

function Para(p)
  -- Strip out Space and SoftBreak nodes; check if the only remaining child
  -- is a single Image element.
  local meaningful = {}
  for _, el in ipairs(p.content) do
    if el.t ~= "Space" and el.t ~= "SoftBreak" and el.t ~= "LineBreak" then
      table.insert(meaningful, el)
    end
  end

  if #meaningful == 1 and meaningful[1].t == "Image" then
    -- Wrap the paragraph in a Div with class "image-block".
    -- The image's own classes (image-anchor / image-opener / image-system /
    -- image-end) are preserved via the Image element inside.
    return pandoc.Div(
      { p },
      pandoc.Attr("", { "image-block" }, {})
    )
  end
end
