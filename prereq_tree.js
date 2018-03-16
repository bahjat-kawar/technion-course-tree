var num_nodes = 0;
var shown_faculties = [];

function ui_rerender() {
	var root_course = get_course(document.getElementById("rootCourse").value);
	if(root_course == null) {
		alert("הקורס לא קיים");
		return;
	}
	num_nodes = -1;
	shown_faculties = [];
	document.getElementById("rootUL").innerHTML = "";
	ui_add_node("rootUL", {
		"course_id": root_course["course_id"],
		"course_name": root_course["course_name"],
		"link_type": "קדם"
	});
	shown_faculties = get_select_values(document.getElementById("faculty"));
	toggle_faculty();
	if(document.getElementById("faculty").style.display != "none") toggle_faculty();
}

function toggle_faculty() {
	if(document.getElementById("faculty").style.display == "none") {
		document.getElementById("faculty").style.display = "inline-block";
		document.getElementById("facultyList").style.display = "none";
	} else {
		update_faculty_list();
		document.getElementById("faculty").style.display = "none";
		document.getElementById("facultyList").style.display = "inline-block";
	}
}

function ui_toggle_toolbar() {
	if(document.getElementById("toolbox").style.display == "none") {
		document.getElementById("toolbox").style.display = "inline-block";
		document.getElementById("info").style.display = "none";
		document.getElementById("toggleButton").value = "מידע";
	} else {
		update_faculty_list();
		document.getElementById("toolbox").style.display = "none";
		document.getElementById("info").style.display = "inline-block";
		document.getElementById("toggleButton").value = "הגדרות";
	}
}

function update_faculty_list() {
	var faculties = get_select_labels(document.getElementById("faculty"));
	document.getElementById("facultyList").innerHTML = "";
	for(var i = 0; i < faculties.length; i++) {
		if(i != 0) document.getElementById("facultyList").innerHTML += ", ";
		document.getElementById("facultyList").innerHTML += faculties[i];
	}
	if(document.getElementById("facultyList").innerHTML.length > 70) {
		document.getElementById("facultyList").innerHTML = document.getElementById("facultyList").innerHTML.substring(0, 70) + "...";
	}
	if(faculties.length == 0) document.getElementById("facultyList").innerHTML = "כל הפקולטות";
}

function ui_generate_successors(node_num, course_id) {
	if(document.getElementById('u' + node_num).children.length != 0) {
		return;
	}
	var successors = get_immediate_successors(course_id);
	for(var i=0; i < successors.length; i++) {
		ui_add_node('u' + node_num, successors[i]);
	}
}

function ui_add_node(parent_node_id, link_obj) {
	if(is_hidden(link_obj["course_id"])) return;
	num_nodes++;
	var has_suc = has_successors(link_obj["course_id"]);
	var li = document.createElement("li");
	var label = document.createElement("label");
	if(has_suc) {
		var cbox = document.createElement("input");
		cbox.type = "checkbox";
		cbox.id = "c" + num_nodes;
		li.appendChild(cbox);
		label.htmlFor = "c" + num_nodes;
		label.classList.add("tree_label");
		label.setAttribute("onClick", "ui_generate_successors(" + num_nodes + ", '" + link_obj["course_id"] + "');");
	}
	label.innerHTML = "<span class='tree_label" + (link_obj["link_type"] == "קדם" ? "" : " tsamud") + "'><a href='https://ug3.technion.ac.il/rishum/course/" + link_obj["course_id"] + "/' target='_blank'>" + link_obj["course_id"] + "</a><br>" + link_obj["course_name"] + "</span>";
	li.appendChild(label);
	
	//add kdamim hover
	var course_obj = get_course(link_obj["course_id"]);
	if(course_obj != null && (course_obj["kdam"] != "" || course_obj["tsamud"] != "")) {
		var kdam = document.createElement("span");
		kdam.classList.add("kdam");
		kdam.classList.add("kdam" + num_nodes);
		kdam.style.marginRight = "5px";
		var kdams = (course_obj["kdam"] == "" ? "<br>" : "<b>מקצועות קדם: </b>" + course_obj["kdam"]);
		var tsmds = (course_obj["tsamud"] == "" ? "<br>" : "<b>מקצועות צמודים: </b>" + course_obj["tsamud"]);
		if(kdams.length > 70) kdams = kdams.substring(0, 70) + "...";
		if(tsmds.length > 70) tsmds = tsmds.substring(0, 70) + "...";
		kdam.innerHTML = kdams + "<br>" + tsmds;
		kdam.innerHTML = linkify(kdam.innerHTML);
		li.appendChild(kdam);
	}
	
	var ul = document.createElement("ul");
	ul.id = "u" + num_nodes;
	li.appendChild(ul);
	document.getElementById(parent_node_id).appendChild(li);
}

function is_hidden(course_id) {
	if(shown_faculties.length == 0) return false;
	for(var i =0; i < shown_faculties.length; i++) {
		if(course_id.indexOf(shown_faculties[i]) == 0) return false;
	}
	return true;
}

function linkify(str) {
	var ids = [], regexes = [], str2 = str;
	for(var i = 0; i < str.length - 5; i++) {
		if(!is_valid_id(str.substring(i, i+6))) continue;
		var found = false;
		for(var j=0; j < ids.length; j++) if(ids[j] == str.substring(i, i+6)) {
			found = true;
			break;
		}
		if(found) continue;
		ids.push(str.substring(i, i+6));
		regexes.push(new RegExp(str.substring(i, i+6), "g"));
	}
	for(var i = 0; i < regexes.length; i++) {
		str2 = str2.replace(regexes[i], "<a href='https://ug3.technion.ac.il/rishum/course/" + ids[i] + "/' target='_blank'>" + ids[i] + "</a>");
	}
	return str2;
}

function is_valid_id(course_id) {
	for(var i = 0; i < 6; i++) {
		if(course_id[i] < '0' || course_id[i] > '9') return false;
	}
	return true;
}

function get_select_values(select) {
  var result = [];
  var options = select && select.options;
  var opt;

  for (var i=0, iLen=options.length; i<iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(opt.value || opt.text);
    }
  }
  return result;
}

function get_select_labels(select) {
  var result = [];
  var options = select && select.options;
  var opt;

  for (var i=0, iLen=options.length; i<iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(opt.text);
    }
  }
  return result;
}

function get_immediate_successors(course_id) {
	var successors = [];
	for(var i=0; i < courses_unified.length; i++) {
		if(typeof courses_unified[i]["kdam"] !== 'undefined' &&
		courses_unified[i]["kdam"].includes(course_id)) {
			successors.push({
				"course_id": courses_unified[i]["course_id"],
				"course_name": courses_unified[i]["course_name"],
				"link_type": "קדם"
			});
		}
		else if(typeof courses_unified[i]["tsamud"] !== 'undefined' &&
		courses_unified[i]["tsamud"].includes(course_id)) {
			successors.push({
				"course_id": courses_unified[i]["course_id"],
				"course_name": courses_unified[i]["course_name"],
				"link_type": "צמוד"
			});
		}
	}
	return successors;
}

function has_successors(course_id) {
	for(var i=0; i < courses_unified.length; i++) {
		if(is_hidden(courses_unified[i]["course_id"])) continue;
		if(typeof courses_unified[i]["kdam"] !== 'undefined' &&
		courses_unified[i]["kdam"].includes(course_id)) {
			return true;
		}
		else if(typeof courses_unified[i]["tsamud"] !== 'undefined' &&
		courses_unified[i]["tsamud"].includes(course_id)) {
			return true;
		}
	}
	return false;
}

function get_immediate_predecessors(course_id) {
	var predecessors = [];
	var course = get_course(course_id);
	if(typeof course["kdam"] !== 'undefined') {
		courses = course["kdam"].split(" ");
		for(var i = 0; i < courses.length; i++) {
			if(!is_valid_id(courses[i])) continue;
			curr_course = get_course(courses[i]);
			if(curr_course != null) predecessors.push({
				"course_id": curr_course["course_id"],
				"course_name": curr_course["course_name"],
				"link_type": "קדם"
			});
		}
	}
	if(typeof course["tsamud"] !== 'undefined') {
		courses = course["tsamud"].split(" ");
		for(var i = 0; i < courses.length; i++) {
			if(!is_valid_id(courses[i])) continue;
			curr_course = get_course(courses[i]);
			if(curr_course != null) predecessors.push({
				"course_id": curr_course["course_id"],
				"course_name": curr_course["course_name"],
				"link_type": "צמוד"
			});
		}
	}
	return predecessors;
}

function get_course(course_id) {
	var course = null;
	for(var i=0; i < courses_unified.length; i++) {
		if(courses_unified[i]["course_id"] == course_id) course = courses_unified[i];
	}
	return course;
}