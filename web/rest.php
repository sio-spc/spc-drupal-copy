<html>
<head>
<?php
$url = "http://spc.plethoradesign.com";
$limit = 4;
?>
<style media="all">
@import url("<?php print $url;?>/themes/custom/kyanite/css/base.css?p6q5b5");
@import url("<?php print $url;?>/themes/custom/kyanite/css/layout.css?p6q5b5");
@import url("<?php print $url;?>/themes/custom/kyanite/css/components.css?p6q5b5");
@import url("<?php print $url;?>/themes/custom/kyanite/css/colors.css?p6q5b5");
</style>
<script src="<?php print $url;?>/themes/custom/kyanite/js/jquery-2.2.4.min.js?v=3.2.1"></script>
<script type="text/javascript">
$.ajax({
  url: 'http://spc.plethoradesign.com/contentsync/updates/1430?_format=json',
  method: 'GET',
  success: function (json) {
    console.log(json);

    var html = "<div class='spcgrid updates'><div class='kyanite-views-rows'>";

    var arrayLength = json.length;
    console.log("arrayLength: " + arrayLength);
    if(<?php print $limit;?> < arrayLength){
        var limit = <?php print $limit;?>
    }
    else{  
        var limit = arrayLength;
    }
    for (var i = 0; i < limit; i++) {

        function j(el){
            return json[i][el];
        }
        html += "<div class='views-row'><div class='kyanite-views-row-inner'><a href='" + j("link") + "'>";
        html += "<div class='views-field views-field-field-featured-image'>" + j("image") + "</div>";
        html += "<div class='views-field views-field-nothing-1'>" + j("text") + "</div>";
        html += "</a></div></div>"
    }
    html += "</div></div>";
    $("body").html(html);

    
  }
});


</script>
</head>
<body>
</body>
</html>
