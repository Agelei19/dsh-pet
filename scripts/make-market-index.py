"""生成 DSH 插件市场索引（格式 1）。用法：python make_index.py <commit> <version> [timestamp]"""
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'dsh-pet', 'market', 'index.json')


def build(commit, version, ts=None):
    ts = int(ts or time.time())
    return {
        'format': 1,
        'title': {'en': 'Agelei19 DSH Plugins', 'zh': 'Agelei19 的 DSH 插件'},
        'description': {
            'en': 'Plugins published by Agelei19 for DeepSeek Harness.',
            'zh': 'Agelei19 发布的 DeepSeek Harness 插件。',
        },
        'metadata': {
            'categories': {'pets': {'title': {'en': 'Pets', 'zh': '桌面宠物'}}},
            'labels': {'zh': {'title': {'en': 'Chinese', 'zh': '中文'}}},
        },
        'plugins': [
            {
                'name': 'puppy',
                'title': {'en': 'Puppy — desktop pet', 'zh': '小狗 · 桌面宠物'},
                'description': {
                    'en': 'A round little golden puppy that lives on your desktop: breathes, wags, rolls over, '
                          'sleeps on its side and pulls bones out from behind its back. 51 hand-directed animations: idle, walking, playing, work, peeking from screen edges and more.',
                    'zh': '一只圆滚滚的小金毛住进你的桌面：会呼吸、会摇尾巴、会打个滚、会侧趴睡觉，'
                          '还会从背后掏出骨头。51 段动画，干活时在头顶报进度。',
                },
                'icon': 'icon.png',
                'author': 'Agelei19',
                'homepage': 'https://github.com/Agelei19/dsh-pet-puppy',
                'repository': {'url': 'https://github.com/Agelei19/dsh-pet-puppy', 'directory': 'dsh-pet'},
                'metadata': {'category': 'pets', 'keywords': ['desktop pet', 'puppy', '桌宠', '小狗'],
                             'labels': ['zh']},
                'versions': [
                    {
                        'version': version,
                        'publishTimestamp': ts,
                        'source': {
                            'type': 'git',
                            'url': 'https://github.com/Agelei19/dsh-pet-puppy',
                            'commit': commit,
                            'path': 'dsh-pet',
                        },
                    }
                ],
            }
        ],
    }


if __name__ == '__main__':
    commit = sys.argv[1]
    version = sys.argv[2]
    ts = sys.argv[3] if len(sys.argv) > 3 else None
    doc = build(commit, version, ts)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('wrote', OUT)
