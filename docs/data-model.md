# 数据模型

## Article
代表文章、元文章、讨论串、文件、后台解析器、前端界面文件、元数据属性名和历史串属性名的对象，组织文章的元数据和各项历史。
### 元文章类型
此类型为所有被翻译文章的
### id
标记这个对象，sha-256字符串值
### data
存放文章元数据，具有历史记录。

键类型支持字符串，值类型支持：`Unknown`，数值，字符串，其他条目`Article`，日期，地理位置

### historys
键值对数组（`Recordset<article|history>`），存放文章元数据。
#### 默认值
- `raw:rawhistory`
	用户上传的原始文档历史
- `meta:metahistory`
	元数据历史
- `log:loghistory`
	日志历史

## HistoricalObject
数据历史对象。
### recent
最近数据块，只读，由历史记录的最近项目生成。
### history
存放文章历史。只能向该列表添加值，而无法修改已有值。

## Blob
数据块对象，记录文章的历史版本。

默认情况下一旦产生便不再变动。
### mime
标记mime类型。
### content
内容
### author
数据块的上传者
### method
后端解析器（`Article`），上传数据块使用的解析器。
### date
数据块的创建日期

## User
存放用户认证的相关信息（密码等），不管理权限。
### name
全局唯一，用户名
### auth
存储用户的认证方式与凭据
#### email
#### phone
电话号码
#### `Third Party Name`
#### passwd
密码的不可逆哈希值

## role
用户对应的角色对象（用户组），一个用户可以属于多个用户组，是全局唯一的字符串。

## Gate
过滤器，过滤用户发起的读取或编辑动作，并放行或阻止相应的动作，从而控制文章、历史或数据块的可见性。

## actionType
采取的动作类型

#### read
读取文章、历史或数据块，撤销某设定为某个用户组即为对其他用户隐藏该条目。

#### append

向历史串添加数据块。

#### create
创建文章并将其历史串创建为空串

#### executeRead
将文章的最近版本作为宏代码读取

#### changeUser
修改用户属性，包括修改用户权限

## TS伪代码

```typescript
class Article{
	id:hash;
	data:HistoricalObject<Metadata> 
	__rendered:DocTree;
	content:HistoricalObject<
		DocTree | ByteArray | Article | Code
	>;
}

type dataValue = string | number | Article |Geometry | null
enum type{
	article,dataArticle,comment,file,styledef,frontenddef
}
interface Metadata extends Record<string,dataValue|Array<dataValue>>{
	nameas:string[];
	type:type;
	language:lang;
	requires:Array<Article>;
	childOf:Article;
	redirectto:Article;
}

class Blob<content>{
	content:content;
	type:mime;
	modifier:User;
	timestamp:timestamp;
}

class HistoricalObject<content>{
	history:Array<Blob<content>>;
	recent:content;
}

function diff<content,contentdiff>(base:content,changed:content): contentdiff;
function patch<content,contentdiff>(base:content,changed:contentdiff): content;

class Gate {
	test:(conditions:EditAttempt<content>)=>bool;
	actions:Array;
}

enum actionType{
	read,writeMerge,writeCover,executeRead,create,delete,
	changeAuth,createUser,removeUser,login
	changeUser,
	changeGate,
	rateExceed,
}
interface Loggable{
	action:actionType
	timestamp:timestamp;
	source:User;
}
class EditAttempt<content> extends Loggable {
	position:[HistoricalObject<content>,Blob<content>];
	content?:content;
	article?:string
}
class UserChange extends Loggable{
	target:User;
}

class User{
	name:string;
	auths:;
	profiles:Profiles;
	statstics:{
		role:role[];
		editnum:number;
		createtime:number;
		lastip:ipAddress;
	}
}

interface Profiles extends Record<string,any>{
	stylefile:HistoricalObject<DocTree | Code>

}
interface Auths extends Record<string,any>{
	passwd:hash;
	phone:phone;
	email:email;
}
```