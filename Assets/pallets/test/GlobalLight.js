#pragma strict
private var dirLight : Light;
private var dirLightRoot : Transform;

function Start () {
	dirLight = gameObject.GetComponent(Light);
	dirLightRoot = transform.parent;
}

function Update () {
	dirLight.intensity = Mathf.Lerp(dirLight.intensity, 0.0, Time.deltaTime / 25);
	dirLightRoot.rotation.y += Time.deltaTime / 25;
}