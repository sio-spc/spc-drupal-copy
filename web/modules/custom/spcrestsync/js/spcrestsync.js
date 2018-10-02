(function ($, Drupal, drupalSettings) {


    Drupal.behaviors.spcRESTsyncUpdates = {
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
                    var image = "";
                    var html = "<div class='spcgrid updates center spcrestsync-updates'><div class='kyanite-views-rows'>";

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
                        image = j("image").replace('<img src="/','<img src="https://www.spc.int/');
                        //html = html.replace('<img src="/','<img src="https://www.spc.int/');
                        html += "<div class='views-field views-field-field-featured-image'>" + image + "</div>";
                        html += "<div class='views-field views-field-nothing-1'>" + j("text") + "</div>";
                        html += "<div class='views-field views-field-nothing-2'>" + j("updatestypedate") + "</div>";
                        html += "</a></div></div>"
                    }
                    html += "</div></div>";
                    

                    $(blockelement+" .spcrestsync-content").html(html);
                }
                 

                  if(!$(blockelement+" .spcrestsync-content").hasClass("processed")){
                    $(blockelement+" .spcrestsync-content").addClass("processed");
                    console.log("selector: " + blockelement+" .spcrestsync-content");
                    console.log("spcrestsync not processed yet, block " + blockelement);
                    console.log("division id: " + divisionid);
                      $.ajax({
                          url: 'https://www.spc.int/contentsync/updates/'+divisionid+'?_format=json',
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

    Drupal.behaviors.spcRESTsyncEvents = {
      attach: function (context, settings) { 

          if($(".spcrestsync-content").length){//only run if the blocks exist on the current page

              var spcblocks = drupalSettings.spcblocks;
              console.log("spcblocks: " + spcblocks);
              //console.log("spcblocks 0: " + spcblocks[0]);
              //var blockarray = [];
              var i;
              $.each( spcblocks, function( key, value ) {
                  //console.log("key: " + key);

                  var blockid = value[0].replace("spcevents_","");

                  var limit = value[1];
                  console.log("limit of "+limit+" for block "+blockid);
                  //var limit = drupalSettings.limit;
                  var divisionid = value[2];
                  if(divisionid == null){
                    divisionid = "all";
                  }

                  if(blockid == "spcevents"){
                    var blockelement = "#block-spcevents";
                  }
                  else{
                    var blockelement = "#block-spcevents-"+blockid;
                  }
                  console.log("blockelement: " + blockelement);


                function successfunction(json){
                    var limit = value[1];
                    var image = "";
                    var html = "<div class='eventsview spcrestsync-events'><div class='item-list'><ul>";

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
                        image = j("image").replace('<img src="/','<img src="https://www.spc.int/');                        

                        html += "<li><div class='views-field views-field-field-event-date-end eventsviewdates'>";
                        html += "<div class='field-content'><time datetime='00Z'>"+j("field_event_date_start")+"</time>";
                        if(j("field_event_date_end") != ""){
                          html += " - <time datetime='00Z'>"+j("field_event_date_end")+"</time>";
                        }
                        html += "</div></div>";
                        html += "<div class='views-field views-field-nothing'><span class='field-content'>";
                        html += "<a href='"+j("link")+"'>"+image+"</a>";
                        html += "<h2><a href='"+j("link")+"'>"+j("title")+"</a></h2>";
                        html += "</span></div></li>";
                    }
                    html += "</ul></div></div>";
                    

                    $(blockelement+" .spcrestsync-content").html(html);
                }
                 

                  if(!$(blockelement+" .spcrestsync-content").hasClass("processed")){
                    $(blockelement+" .spcrestsync-content").addClass("processed");
                    console.log("selector: " + blockelement+" .spcrestsync-content");
                    console.log("spcrestsync not processed yet, block " + blockelement);
                    console.log("division id: " + divisionid);
                      $.ajax({
                          url: 'https://www.spc.int/contentsync/events/'+divisionid+'?_format=json',
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


    Drupal.behaviors.spcRESTsyncNews = {
      attach: function (context, settings) { 

          if($(".spcrestsync-content").length){//only run if the blocks exist on the current page

              var spcblocks = drupalSettings.spcblocks;
              console.log("spcblocks: " + spcblocks);
              //console.log("spcblocks 0: " + spcblocks[0]);
              //var blockarray = [];
              var i;
              $.each( spcblocks, function( key, value ) {
                  //console.log("key: " + key);

                  var blockid = value[0].replace("spcnews_","");

                  var limit = value[1];
                  console.log("limit of "+limit+" for block "+blockid);
                  //var limit = drupalSettings.limit;
                  var divisionid = value[2];
                  if(divisionid == null){
                    divisionid = "all";
                  }

                  if(blockid == "spcnews"){
                    var blockelement = "#block-spcnews";
                  }
                  else{
                    var blockelement = "#block-spcnews-"+blockid;
                  }
                  console.log("blockelement: " + blockelement);


                function successfunction(json){
                    var limit = value[1];
                    var image = "";
                    var html = "<div class='spcgrid updates center spcrestsync-news'><div class='kyanite-views-rows'>";

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
                        image = j("image").replace('<img src="/','<img src="https://www.spc.int/');                        

                        html += "<div class='views-row'><div class='kyanite-views-row-inner'>";
                        html += "<div class='views-field views-field-field-featured-image'><div class='field-content'>";
                        html += "<a href='"+j("link")+"'>"+image+"</a>";
                        html += "</div></div>";
                        html += "<div class='views-field views-field-nothing-1'><span class='field-content'><a href='"+j("link")+"'><h2>"+j("title")+"</h2></a>";
                        html += "<span class='contenttype contenttype-news'>News</span>";
                        html += " <span class='created'>"+j("date")+"</span>";
                        html += "</span></div></div></div>";
                    }
                    html += "</div></div>";
                    

                    $(blockelement+" .spcrestsync-content").html(html);
                }
                 

                  if(!$(blockelement+" .spcrestsync-content").hasClass("processed")){
                    $(blockelement+" .spcrestsync-content").addClass("processed");
                    console.log("selector: " + blockelement+" .spcrestsync-content");
                    console.log("spcrestsync not processed yet, block " + blockelement);
                    console.log("division id: " + divisionid);
                      $.ajax({
                          url: 'https://www.spc.int/contentsync/news/'+divisionid+'?_format=json',
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


    Drupal.behaviors.spcRESTsyncBlog = {
      attach: function (context, settings) { 

          if($(".spcrestsync-content").length){//only run if the blocks exist on the current page

              var spcblocks = drupalSettings.spcblocks;
              console.log("spcblocks: " + spcblocks);
              //console.log("spcblocks 0: " + spcblocks[0]);
              //var blockarray = [];
              var i;
              $.each( spcblocks, function( key, value ) {
                  //console.log("key: " + key);

                  var blockid = value[0].replace("spcblog_","");

                  var limit = value[1];
                  console.log("limit of "+limit+" for block "+blockid);
                  //var limit = drupalSettings.limit;
                  var divisionid = value[2];
                  if(divisionid == null){
                    divisionid = "all";
                  }

                  if(blockid == "spcblog"){
                    var blockelement = "#block-spcblog";
                  }
                  else{
                    var blockelement = "#block-spcblog-"+blockid;
                  }
                  console.log("blockelement: " + blockelement);


                function successfunction(json){
                    var limit = value[1];
                    var image = "";
                    var html = "<div class='spcgrid updates center spcrestsync-blog'><div class='kyanite-views-rows'>";

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
                        image = j("image").replace('<img src="/','<img src="https://www.spc.int/');                        

                        html += "<div class='views-row'><div class='kyanite-views-row-inner'>";
                        html += "<div class='views-field views-field-field-featured-image'><div class='field-content'>";
                        html += "<a href='"+j("link")+"'>"+image+"</a>";
                        html += "</div></div>";
                        html += "<div class='views-field views-field-nothing-1'><span class='field-content'><a href='"+j("link")+"'><h2>"+j("title")+"</h2></a>";
                        html += "<span class='contenttype contenttype-news'>Web Stories</span>";
                        html += " <span class='created'>"+j("date")+"</span>";
                        html += "</span></div></div></div>";
                    }
                    html += "</div></div>";
                    

                    $(blockelement+" .spcrestsync-content").html(html);
                }
                 

                  if(!$(blockelement+" .spcrestsync-content").hasClass("processed")){
                    $(blockelement+" .spcrestsync-content").addClass("processed");
                    console.log("selector: " + blockelement+" .spcrestsync-content");
                    console.log("spcrestsync not processed yet, block " + blockelement);
                    console.log("division id: " + divisionid);
                      $.ajax({
                          url: 'https://www.spc.int/contentsync/webstories/'+divisionid+'?_format=json',
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


    Drupal.behaviors.spcRESTsyncVideos = {
      attach: function (context, settings) { 

          if($(".spcrestsync-content").length){//only run if the blocks exist on the current page

              var spcblocks = drupalSettings.spcblocks;
              console.log("spcblocks: " + spcblocks);
              //console.log("spcblocks 0: " + spcblocks[0]);
              //var blockarray = [];
              var i;
              $.each( spcblocks, function( key, value ) {
                  //console.log("key: " + key);

                  var blockid = value[0].replace("spcvideos_","");

                  var limit = value[1];
                  console.log("limit of "+limit+" for block "+blockid);
                  //var limit = drupalSettings.limit;
                  var divisionid = value[2];
                  if(divisionid == null){
                    divisionid = "all";
                  }

                  if(blockid == "spcvideos"){
                    var blockelement = "#block-spcvideos";
                  }
                  else{
                    var blockelement = "#block-spcvideos-"+blockid;
                  }
                  console.log("blockelement: " + blockelement);


                function successfunction(json){
                    var limit = value[1];
                    var image = "";
                    var html = "<div class='spcgrid updates center spcrestsync-videos'><div class='kyanite-views-rows'>";

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
                        image = j("image").replace('<img src="/','<img src="https://www.spc.int/');                        

                        html += "<div class='views-row'><div class='kyanite-views-row-inner'>";
                        html += "<div class='views-field views-field-field-featured-image'><div class='field-content'>";
                        html += "<a href='"+j("link")+"'>"+image+"</a>";
                        html += "</div></div>";
                        html += "<div class='views-field views-field-nothing-1'><span class='field-content'><a href='"+j("link")+"'><h2>"+j("title")+"</h2></a>";
                        html += "<span class='contenttype contenttype-news'>Web Stories</span>";
                        html += " <span class='created'>"+j("date")+"</span>";
                        html += "</span></div></div></div>";
                    }
                    html += "</div></div>";
                    

                    $(blockelement+" .spcrestsync-content").html(html);
                }
                 

                  if(!$(blockelement+" .spcrestsync-content").hasClass("processed")){
                    $(blockelement+" .spcrestsync-content").addClass("processed");
                    console.log("selector: " + blockelement+" .spcrestsync-content");
                    console.log("spcrestsync not processed yet, block " + blockelement);
                    console.log("division id: " + divisionid);
                      $.ajax({
                          url: 'https://www.spc.int/contentsync/videos/'+divisionid+'?_format=json',
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

