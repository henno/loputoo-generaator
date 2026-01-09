local unnumbered_titles = {
  ["sissejuhatus"] = true,
  ["kokkuvõte"] = true,
  ["kasutatud allikate loetelu"] = true,
  ["kirjandus"] = true,
  ["summary"] = true,
}

local function normalize(s)
  return (s or "")
    :gsub("%s+", " ")
    :gsub("^%s+", "")
    :gsub("%s+$", "")
    :lower()
end

local in_appendix = false

function Header(h)
  if h.level ~= 1 then
    return nil
  end

  local title_text = pandoc.utils.stringify(h.content)
  local key = normalize(title_text)

  if key == "lisad" then
    in_appendix = true
    h.classes:insert("unnumbered")
    if not h.attributes["label"] then
      h.attributes["label"] = title_text
    end
    return h
  end

  if unnumbered_titles[key] then
    h.classes:insert("unnumbered")
    if not h.attributes["label"] then
      h.attributes["label"] = title_text
    end
    return h
  end

  return nil
end

function Pandoc(doc)
  if not in_appendix then
    return doc
  end

  local out = {}

  for _, block in ipairs(doc.blocks) do
    if block.t == "Header" and block.level == 1 then
      local t = normalize(pandoc.utils.stringify(block.content))
      if t == "lisad" then
        table.insert(out, block)
        table.insert(out, pandoc.RawBlock("latex", "\\appendix"))
      else
        table.insert(out, block)
      end
    else
      table.insert(out, block)
    end
  end

  doc.blocks = out
  return doc
end
