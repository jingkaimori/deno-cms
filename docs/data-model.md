# 数据模型

## Article
代表文章、讨论串、文件、后台解析器、前端界面文件、元数据属性名和历史串属性名的对象，组织文章的元数据和各项历史。
### id
标记这个对象，sha-256字符串值
### data
键值对数组（`Recordset<article|any>`），存放文章元数据。

类型支持：`Unknown`，数值，字符串，其他条目`Article`，日期，地理位置

不应该被直接编辑，而应该由data历史串的最近blob生成。
### historys
键值对数组（`Recordset<article|history>`），存放文章元数据。
#### 默认值
- `raw:rawhistory`
	用户上传的原始文档历史
- `meta:metahistory`
	元数据历史
- `log:loghistory`
	日志历史

### permission
`gate`对象

## Historys
数据历史对象
### recent
最近数据块
### list
数组（`Array<blob>`），存放文章历史。
### permission
`gate`对象

## Blob
数据块对象，记录文章的历史版本或操作日志。

默认情况下一旦产生便不再变动。
### id
标记这个对象，sha-256字符串值
### mime
字符串，标记mime类型。日志数据块的该字段有特殊值：
### content
内容（`ArrayBuffer`）
### author
用户（`user`），数据块的上传者
### method
后端解析器（`Article`），上传数据块使用的解析器。
### date
数据块的创建日期
### permission
`gate`对象

## User
存放用户认证的相关信息（密码等），不管理权限。
### name
全局唯一，用户名
### passwd
密码的sha-256值
### auth
#### email
#### phone
#### `Third Party Name`
### role
该用户对应的角色对象

## Role
用户对应的角色对象（用户组），管理用户的权限。
### name
全局唯一
### permission
#### createblob
#### createarticle
#### removearticle
#### createuser
#### setuser
#### setpermission

## Gate
标识文章、历史或数据块的可见性。
#### read
读取文章、历史或数据块，设定为某个用户组即为对其他用户隐藏该条目。
#### append
向文章添加历史串，

向历史串添加数据块，

对数据块而言无意义。
#### create
创建数据块
#### execute
将文章的最近版本