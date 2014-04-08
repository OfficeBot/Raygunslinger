#pragma strict
var speed : Number = 1;
function Start () {

}

function Update () {
	var x : float = Input.GetAxis ("Horizontal") * speed * Time.deltaTime;
	var y : float = Input.GetAxis ("Vertical") * speed * Time.deltaTime;
	transform.Translate (x, y, 0);
}