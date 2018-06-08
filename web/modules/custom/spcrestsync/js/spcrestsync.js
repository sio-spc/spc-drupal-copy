(function ($, Drupal, drupalSettings) {


    Drupal.behaviors.spcRESTsync = {
      attach: function (context, settings) { 

          if($(".spcrestsync-content").length){//only run if the blocks exist on the current page

              var spcblocks = drupalSettings.spcblocks;
              console.log("spcblocks: " + spcblocks);
              //console.log("spcblocks 0: " + spcblocks[0]);
              //var blockarray = [];
              var i;
              $.each( spcblocks, function( key, value ) {
                  //console.log("key: " + key);

                  var blockid = value[0].replace("spcupdates_","");

                  var limit = value[1];
                  console.log("limit of "+limit+" for block "+blockid);
                  //var limit = drupalSettings.limit;
                  var divisionid = value[2];
                  if(divisionid == null){
                    divisionid = "all";
                  }

                  if(blockid == "spcupdates"){
                    var blockelement = "#block-spcupdates";
                  }
                  else{
                    var blockelement = "#block-spcupdates-"+blockid;
                  }
                  console.log("blockelement: " + blockelement);


                function successfunction(json){
                    var limit = value[1];
                    var html = "<div class='spcgrid updates center'><div class='kyanite-views-rows'>";

                            var arrayLength = json.length;
                            console.log("arrayLength: " + arrayLength);
                            console.log("limit is: " + limit);
                            if(limit < arrayLength){
                                var limit = limit
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
                            html = html.replace('<img src="/','<img src="http://spc.plethoradesign.com/');

                            $(blockelement+" .spcrestsync-content").html(html);
                }
                 

                  if(!$(blockelement+" .spcrestsync-content").hasClass("processed")){
                    $(blockelement+" .spcrestsync-content").addClass("processed");
                    console.log("selector: " + blockelement+" .spcrestsync-content");
                    console.log("spcrestsync not processed yet, block " + blockelement);
                    console.log("division id: " + divisionid);
                      $.ajax({
                          url: 'http://spc.plethoradesign.com/contentsync/updates/'+divisionid+'?_format=json',
                          async: false,
                          method: 'GET',
                          success: function (json, status, settings) {
                            
                            successfunction(json);
                            
                          },
                          error: function(XMLHttpRequest, textStatus, errorThrown) { 
                                //alert("Status: " + textStatus); alert("Error: " + errorThrown); 
                                html = "";
                                return;
                            } 
                        });
                    };
                    
                    blockid = "";
                    blockelement = "";
                    html = "";
                    i++;
                })
            }
      }

    };


   



}) (jQuery, Drupal, drupalSettings);

