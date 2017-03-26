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
					innerHTML += "<ul><li><input type='checkbox'>";
					innerHTML += arr.join("<span></span></li><li><input type='checkbox'>") +"<span></span></li></ul>";
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
		cmd('delDoing', text);
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
		cmd('delDone', text);
	}
	else if (target.nodeName === "LI") {
	}
}


/**
 * 根据type来决定增改删操作，
 * @param  {[string]} type [根据type来决定增改删操作]
 * @param  {[string]} text  [决定mysql语句中的变化的文本]
 * @param  {[string]} dom  [根据要求查询不同的DOM，局部刷新]
 * @return {[type]}      [description]
 */
function cmd(type, text) {
	request = new XMLHttpRequest();
	request.open('POST', 'service.php');
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	request.send('cmd='+ type + '&text=' + text);
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200) {
				//对于如果不让添加的TODO没有插入数据库，自然也不用去渲染DOM
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
