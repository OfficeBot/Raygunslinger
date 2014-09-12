#pragma strict
private var outerBias : float = 0.25;
private var innerBias : float = 1.0;
private var innerRadius : float = 10.0;
private var outerRadius : float = 1.0;

private var sCollider : SphereCollider;
var showLetterbox = true;

function Start() {
	sCollider = gameObject.GetComponent(SphereCollider);
	sCollider.radius = sCollider.radius * 1.25;
	outerRadius = transform.localScale.magnitude * sCollider.radius;
	innerRadius = outerRadius / 2.75;
}

function GetInnerRadius() {
	return innerRadius;
}

function GetOuterRadius() {
	return outerRadius;
}

function Update () {

	// var planes: Plane[] = GeometryUtility.CalculateFrustumPlanes(Camera.main);
 //    if (GeometryUtility.TestPlanesAABB(planes,renderer.bounds)) {
 //       currentBias = innerBias;
 //    } else {
 //      currentBias = outerBias;
 //    }
}