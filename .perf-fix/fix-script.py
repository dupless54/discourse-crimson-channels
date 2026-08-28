from pathlib import Path

path = Path('.perf-fix/apply.py')
text = path.read_text()
old = '''old_raf = \'\'\'\\n  window.requestAnimationFrame(() => {\\n    syncThemeSettings();\\n    bindToggleButton();\\n    scheduleMobileCommunityControls();\\n    bindMemberHoverCard();\\n    syncRouteState();\\n    bindDynamicSurfaceObserver();\\n    scheduleDynamicSurfaceDecoration();\\n    scheduleMemberRender();\\n    scheduleFeaturedTopics();\\n  });\\n\'\'\'\njs = replace_once(js, old_raf, "\\n", "remove duplicate initializer pass")\n'''
new = '''raf_marker = "  window.requestAnimationFrame(() => {\\n"\nraf_start = js.rfind(raf_marker)\nif raf_start == -1:\n    raise SystemExit("remove duplicate initializer pass: start marker not found")\nraf_end_marker = "  });\\n});"\nraf_end = js.find(raf_end_marker, raf_start)\nif raf_end == -1:\n    raise SystemExit("remove duplicate initializer pass: end marker not found")\njs = js[:raf_start] + js[raf_end + len("  });\\n"):]\n'''
if text.count(old) != 1:
    raise SystemExit(f'expected one old raf patch block, found {text.count(old)}')
path.write_text(text.replace(old, new, 1))
