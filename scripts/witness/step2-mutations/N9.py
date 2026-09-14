# The consent transport stops naming a real place.
s = s.replace(
    "    return { state: 'executable' as const, authorization, locator };",
    "    void locator;\n"
    "    return { state: 'executable' as const, authorization,\n"
    "      locator: { sectionLabel: '', sectionId: '', range: { space: 'projected_section_body', start: 0, end: 1 },\n"
    "        operation: 'replace_exact_text', changeCount: 1 } };")
