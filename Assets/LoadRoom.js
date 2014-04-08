#pragma strict
var filePath = '';
var tile : GameObject;
var edge : GameObject;
var wall : GameObject;

function Start () {
	ImportFromFile(filePath, ProcessMapData);
}

function Update () {

}

function ProcessMapData(mapData : String) {
	var lines = mapData.Split("\n"[0]);
	var l = lines.length;
	var k = 0;
	var size = 1;
	var ySize = 1;
	for (k = 0; k < l; k++) {
		var line = lines[k];
		var x = line.length;
		var q = 0;
		for (q = 0; q < x; q++) {
			if (line[q] == "#") {
				Instantiate (tile, Vector3(q * size, k * -ySize, 0), Quaternion.identity);
			};
			//overhang
			// if (k+1 >= l) {
			// 	Instantiate (edge, Vector3(q * size, k * -ySize, -1), Quaternion.identity);
			// } else {
			// 	var nextLine = lines[k+1];
			// 	if (nextLine[q] != "#") {
			// 		//this is an edge
			// 		Instantiate (edge, Vector3(q * size, k * -ySize, -1), Quaternion.identity);
			// 	}
			// }
			//---end overhang
			//wall
			// if (k == 0 && k+1 < l) {
			// 	var nl = lines[k+1];
			// 	if (nl[q] == "#" && line[q] )
			// 	Instantiate (wall, Vector3(q * size, k * -size, -1), Quaternion.identity);
			// }
			//--end wall
		}
	}
}

function ImportFromFile(relativePath, cb : function(String)) {
	var url = "file://" + Application.dataPath + "/" + relativePath;
	var download : WWW = new WWW(url);
	yield download;
	cb(download.text);
}