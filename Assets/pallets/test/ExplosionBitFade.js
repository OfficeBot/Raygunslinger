#pragma strict

function Start () {
	yield WaitForSeconds(Random.Range(2,5));
	fadeOut();
}

function fadeOut() {
	while (renderer.material.color.a > 0.1 ) {
	
		renderer.material.color.a = Mathf.Lerp(renderer.material.color.a, 0, Time.deltaTime);
		yield;
	}
	Destroy (gameObject);
}

function Update () {
}