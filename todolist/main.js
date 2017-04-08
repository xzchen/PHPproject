/**
 * randerDom 利用Ajax技术、局部刷新Dom
 * @param  {[string]} domName [表示要刷新的是那个DOM-是doing（）还是done]
 */
function renderDom(domName) {
	var request = new XMLHttpRequest();
	request.open('GET', 'service.php?render=' + domName);
	request.send();
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200) {
				dom = document.getElementById(domName);
				var data = JSON.parse(request.responseText);
				var innerHTML = domName=='doing'?"<h3>正在进行<span>" + data.num +"</span></h3>":"<h3>已经完成<span>" + data.num +"</span></h3>";
				if (data.num != 0) {
					var arr = [];
					for (var i = 0; i < data[domName].length; i++) {
						arr.push(data[domName][i]);
					}
					innerHTML += "<ul onclick='editText()'><li><input type='checkbox'><p>";
					innerHTML += arr.join("</p><span></span></li><li><input type='checkbox'><p>") +"</p><span></span></li></ul>";
				}
				dom.innerHTML = innerHTML;
			}
		}
	}
}

renderDom('doing');  //初始化页面
renderDom('done');

//添加todo
var createToDo = document.getElementById('createToDo');
createToDo.onkeydown = function (ev) {
	ev = ev || window.event;
	var keyCode = ev.keyCode || ev.which || ev.charCode;
	if (keyCode === 13) {
		text = createToDo.value.trim();
		cmd('create', text, 'doing');
		createToDo.value = '';
	}
}

//doing完成转为done  doing => done;
var doing = document.getElementById('doing');
doing.onclick = function (ev) {
	ev = ev || window.event;
	var target = ev.target || ev.srcElement;
	if (target.nodeName === "INPUT") {
		text = target.parentNode.innerText;
		cmd('doingToDone', text)
	}
	else if (target.nodeName === "SPAN") {
		text = target.parentNode.innerText;
		console.log(text)
		cmd('delDoing', text, 'doing');
	}
	else if (target.nodeName === "LI") {
	}
}

//误操作之后done实际未完成转为doing doing => done;
var done = document.getElementById('done');
done.onclick = function (ev) {
	ev = ev || window.event;
	var target = ev.target || ev.srcElement;
	if (target.nodeName === "INPUT") {
		text = target.parentNode.innerText;
		cmd('doneToDoing', text)
	}
	else if (target.nodeName === "SPAN") {
		text = target.parentNode.innerText;
		
		cmd('delDone', text, 'done');
	}
	else if (target.nodeName === "LI") {
	}
}

/**
 * 根据type来决定增改删操作，
 * @param  {[string]} type [根据type来决定增改删操作]
 * @param  {[string]} text  [决定mysql语句中的变化的文本]
 * @param  {[string]} domName  [根据要求查询不同的DOM，局部刷新]
 * @param  {[string]} oldText [对于数据库的update操作，需要根据oldText作为WHRER条件]
 */
function cmd(type, text, domName, oldText) {
	request = new XMLHttpRequest();
	request.open('POST', 'service.php');
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	request.send('cmd='+ type + '&domName=' + domName + '&text=' + text  + '&oldText=' + oldText);
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200) {
				//对于如果不让添加的TODO没有插入数据库，自然也不用去渲染DOM
				//对于update操作。由于再editText函数里就修改了文本。所以就不需要再去执行rendernDom了。
				if (request.responseText !== 'false') {
					if (type === 'create') {
						renderDom('doing');
					}
					else if (type === 'doingToDone') {
						renderDom('doing');
						renderDom('done');
					}
					else if (type === 'doneToDoing') {
						renderDom('done');
						renderDom('doing');
					}
					else if (type === 'delDoing') {
						renderDom('doing');
					}
					else if (type === 'delDone') {
						renderDom('done');
					}
				}
				else {
					return;
				}
			}
		}
	}
	
}


function editText(ev) {
	ev = ev || window.event;
	var target = ev.target || ev.srcElement;
	if (target.nodeName === 'P') {
		var oldText = target.innerText; //得到之前在数据库里保存的数据。如果之后不满足修改条件，就返回原来的值
		target.innerHTML = "<input type ='text' value='" + oldText + "'>";
		var input = target.getElementsByTagName('input')[0];
		input.onclick = function (ev) {
			ev = ev || window.event;
			ev.stopPropagation()
		}
		input.focus();//只要点击了p标签，就进入编辑状态
		input.onblur = function () {//失焦的时候提交数据
			if (this.value) {
				var allList = document.getElementsByTagName('li')
				var allListText = [];
				for (var i = 0; i < allList.length; i++) {
					allListText.push(allList[i].innerText)
				}
				//如果数据没有重复，可以修改为用户修改的数据
				if (allListText.indexOf(this.value) === -1) {
					target.innerHTML = input.value;
				}
				//如果有重复,且重复的就是当前的。说明用户未修改数据
				else if (allListText.indexOf(this.value) === allListText.indexOf(oldText)){
					target.innerHTML = oldText;
					return false;
				}
				else {
					alert('输入数据重复了');
					target.innerHTML = oldText;
					return false;
				}
			}
			else {
				alert("内容不能为空");
				target.innerText = oldText;
				return;
			}
			//判断是修改doing里的list还是done里的list。然后对于不同的dom执行修改。
			if (target.parentNode.parentNode.parentNode.id === 'doing') {
				cmd('updateDoing', target.innerText, 'doing', oldText);
			}
			else {
				cmd('updateDone',target.innerText, 'done', oldText);
			}
		}
		//回车也可以提交数据
		input.onkeydown = function (ev) {
			ev = ev || window.event;
			var keyCode = ev.keyCode || ev.which || ev.charCode;
			if (keyCode === 13) {
				input.onblur();
			}
		}

	}
}