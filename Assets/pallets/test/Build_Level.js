#pragma strict

var levelWidth : int;
var levelHeight : int;
var ground : GameObject;

function Start () {
	for (var k = 0; k < levelWidth; k++) {
		for (var i = 0; i < levelHeight; i++) {
			var newSprite = Instantiate(ground, Vector3(k,i,0),Quaternion.identity);
		}
	}
}

function Update () {

}