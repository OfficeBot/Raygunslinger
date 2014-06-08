#pragma strict
var horizObl : float;
var vertObl : float;

function Start () {

}

function Update () {
	SetObliqueness(horizObl, vertObl);
}

function SetObliqueness(horizObl: float, vertObl: float) {
	var mat: Matrix4x4 = camera.projectionMatrix;
	mat[0, 2] = horizObl;
	mat[0, 1] = horizObl;
	mat[1, 2] = vertObl;
	mat[0, 2] = vertObl;
	camera.projectionMatrix = mat;
}