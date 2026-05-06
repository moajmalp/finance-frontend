import re

with open('src/pages/SettingsPage.jsx', 'r') as f:
    content = f.read()

# Match <Tag or </Tag
# Also need to handle <Tag.Subtag
pattern = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9\.]*)')

stack = []
for match in re.finditer(pattern, content):
    is_closing = match.group(1) == '/'
    tag_name = match.group(2)
    
    # Check if self-closing
    # Find the end of this tag
    start_pos = match.start()
    # Find next '>'
    end_pos = content.find('>', start_pos)
    if end_pos != -1:
        tag_str = content[start_pos:end_pos+1]
        if tag_str.endswith('/>'):
            continue
    
    if not is_closing:
        stack.append((tag_name, content[:match.start()].count('\n') + 1))
    else:
        if not stack:
            print(f"Extra closing tag </{tag_name}> at line {content[:match.start()].count('\n') + 1}")
        else:
            open_tag, line = stack.pop()
            if open_tag != tag_name:
                print(f"Mismatched tag: opened <{open_tag}> at line {line}, closed with </{tag_name}> at line {content[:match.start()].count('\n') + 1}")

for tag, line in stack:
    print(f"Unclosed tag <{tag}> started at line {line}")
