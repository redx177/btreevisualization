$(function() {
	if (window.root == undefined) {
		window.root = new Page();
	}

	$("#insertButton").click(function() {
		window.root.insert($("#insertText").val());
		window.painter.paintRoot();
	});

	window.painter = new Painter();
});