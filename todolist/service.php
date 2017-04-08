<?php  
header('Content-Type:text/plain;charset=utf-8');
$mysqli = new mysqli('localhost', 'root', '', 'user');
$mysqli -> query('set names utf8');
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	seleteMysqli($_GET['render']);
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	cmd($_POST['cmd'], $_POST['text'], $_POST['domName'], $_POST['oldText']);

}
//根据要刷新的DOM，执行不同的mysql语句。查询doing和done列表并返回一个json字符串
function seleteMysqli($field) {
	global $mysqli;
	//查询所有需要完成的事情
	if ($field == 'doing') {
		$sql = 'SELECT doing FROM todolist WHERE doing != ""';
	}
	else {
		$sql = 'SELECT done FROM todolist WHERE done != ""';
	}
	$result = $mysqli -> query($sql);
	//如果list不是0，遍历数组，传回。否则直接传回一个json数据num:0。传回的num值是之后会显示任务计数;
	$num = mysqli_num_rows($result);
	if ($num) {
		$json = "{\"num\":\"$num\",\"$field\":[";
		while ($row = mysqli_fetch_assoc($result)) {
			$json .= "\"$row[$field]\",";
		}
		$json = substr($json, 0, -1);
		$json .= ']}';
		echo $json;
	}
	else {
		echo "{\"num\":\"$num\"}";
	}
}
function cmd($cmd, $text, $domName, $oldText) {
	global $mysqli;
	if ($cmd === 'create') {
		$sql1 = "SELECT * FROM todolist WHERE doing = '$text' OR done = '$text'";
		$result = $mysqli -> query($sql1);
		//禁止添加重复的TODO,包括再doing和done里的
		if (mysqli_num_rows($result)) {
			echo 'false';
			return;
		}
		$sql = "INSERT INTO todolist ($domName) VALUES ('$text')";
	}
	else if ($cmd === 'doingToDone') {
		$sql = "UPDATE todolist SET doing = '', done = '$text' WHERE doing = '$text'";
	}
	else if ($cmd === 'doneToDoing') {
		$sql = "UPDATE todolist SET done = '', doing = '$text' WHERE done = '$text'";
	}
	else if ($cmd === 'updateDoing' || $cmd === 'updateDone') {
		$sql = "UPDATE todolist SET $domName = '$text' WHERE  $domName = '$oldText'";
	}
	else if ($cmd === 'delDoing' || $cmd === 'delDone') {
		$sql = "DELETE FROM todolist WHERE $domName = '$text'";
	}
	$mysqli -> query($sql);
}
?>