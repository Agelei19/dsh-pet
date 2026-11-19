# 插件市场索引（DSH 插件市场格式 1）

这个目录对外提供一份 **插件市场索引**（`index.json`），DSH 的「插件市场」把它当成一个索引源读取。

## 怎么添加

在 DSH 里：**插件 → 插件市场 → 索引源 → 添加**，填入下面这个地址：

```
https://raw.githubusercontent.com/Agelei19/dsh-pet-puppy/puppy/market/index.json
```

添加后市场里会出现 `puppy`（桌面小狗宠物），点安装即可。

> 国内网络访问 `raw.githubusercontent.com` 可能不稳定，可以把 `index.json` 镜像到你自己的静态托管（Gist / jsDelivr / 自建），
> 再把那个地址填进去：`https://cdn.jsdelivr.net/gh/Agelei19/dsh-pet-puppy@puppy/market/index.json`

## 格式说明

```jsonc
{
  "format": 1,
  "title": { "en": "...", "zh": "..." },
  "plugins": [
    {
      "name": "puppy",                       // npm 包名（与 dsh-pet/package.json 的 name 一致）
      "title": { "en": "...", "zh": "..." },
      "icon": "icon.png",                    // 相对本文件的路径，或 https / data: URL
      "versions": [
        {
          "version": "0.6.0",
          "publishTimestamp": 1763500000,     // Unix 秒
          "source": { "type": "git", "url": "https://github.com/Agelei19/dsh-pet-puppy",
                      "commit": "<40 位 commit>", "path": "dsh-pet" }
          // 或者 "source": { "type": "npm", "registry": "https://registry.npmjs.org" }
        }
      ]
    }
  ]
}
```

`source.type = "git"` 时 DSH 会用 `git+https://…#<commit>&path:/dsh-pet` 安装，也就是**固定到某个提交**的安装方式；
`source.type = "npm"` 则需要先把包发到 npm。

`icon.png` 是本仓库里的头像（512×512）。
