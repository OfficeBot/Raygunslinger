#pragma strict
var mapHeight : int = 30;
var mapWidth : int = 30;
var player : Transform;
var cam : Camera;

function Start () {
	// cam = Camera.main;
}

function LateUpdate () {
	var x = player.position.x;
	var y = player.position.y;
	cam.transform.position.x = (x > 0 && x < this.mapWidth) ? x : cam.transform.position.x;
	cam.transform.position.y = (y > 0 && y < this.mapHeight) ? y : cam.transform.position.y;
	Debug.Log(cam.transform.position);
}