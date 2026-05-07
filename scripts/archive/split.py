import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(style_match.group(1).strip())
    content = content.replace(style_match.group(0), '<link rel="stylesheet" href="css/style.css">')

# 2. Extract Sections
sections = ['inicio', 'juntas', 'dashboard', 'sucursales', 'regional', 'formatos', 'about', 'admin-section']
for sec in sections:
    # Match the section and everything inside it
    pattern = r'(<section id="' + sec + r'" class="section(?: active)?">)(.*?)(</section>)'
    sec_match = re.search(pattern, content, re.DOTALL)
    if sec_match:
        with open('pages/' + sec + '.html', 'w', encoding='utf-8') as f:
            f.write(sec_match.group(2).strip())
        replacement = f'<section id="{sec}" class="section" data-page="pages/{sec}.html"></section>'
        content = content.replace(sec_match.group(0), replacement)

# 3. Extract JS
script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
if script_match:
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(script_match.group(1).strip())
    content = content.replace(script_match.group(0), '<script src="js/app.js"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
