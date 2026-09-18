"""Stage only public files; no dependencies or build tooling required."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
out = root / 'dist'
out.mkdir(exist_ok=True)
for name in ('index.html', 'styles.css', 'app.js', 'content.js', 'timeline.js', 'chess-scene.js', 'favicon.svg'):
    shutil.copy2(root / name, out / name)
shutil.copytree(root / 'assets', out / 'assets', dirs_exist_ok=True)
print('Static export ready')
