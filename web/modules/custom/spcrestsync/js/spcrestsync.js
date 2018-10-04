(function ($, Drupal, drupalSettings) {

  $(window).load(function() {
    $(".spcrestsync-updates").each(function(){

      var divisionid = $(this).attr("data-divisionid");
      var limit = $(this).attr("data-limit");
              
      if(!$(this).find(".spcrestsync-content").hasClass("processed")){
        $(this).find(".spcrestsync-content").addClass("processed");
        var spcblocklimit = $(this).attr("data-limit");
        var spcblockid = $(this).attr("id");
        $.ajax({
          url: 'https://www.spc.int/contentsync/updates/'+divisionid+'?_format=json',
          async: false,
          method: 'GET',
          limit: spcblocklimit,
          blockid: spcblockid,
          success: function (json, status, settings) {
            
            var limit = this.limit;
            var blockid = this.blockid;
            var image = "";            
            

            var arrayLength = json.length;
            if(arrayLength > 0){
              var html = "<div class='spcgrid updates center spcrestsync-updates'><div class='kyanite-views-rows'>";
            }
            else{
              var html = "<div class='spscrestsyncnoresults'>No results.</div>";
            }
            if(limit < arrayLength){
                var limit = limit;
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

            $("#"+blockid).find(".spcrestsync-content").html(html);
            
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
            html = "";
            return;
          } 
        })
      };
      html = "";
    });
  

    $(".spcrestsync-events").each(function(){

      var divisionid = $(this).attr("data-divisionid");
      var limit = $(this).attr("data-limit");
              
      if(!$(this).find(".spcrestsync-content").hasClass("processed")){
        $(this).find(".spcrestsync-content").addClass("processed");
        var spcblocklimit = $(this).attr("data-limit");
        var spcblockid = $(this).attr("id");
        $.ajax({
          url: 'https://www.spc.int/contentsync/events/'+divisionid+'?_format=json',
          async: false,
          method: 'GET',
          limit: spcblocklimit,
          blockid: spcblockid,
          success: function (json, status, settings) {
            
            var limit = this.limit;
            var blockid = this.blockid;
            var image = "";


            var arrayLength = json.length;
            if(arrayLength > 0){
              var html = "<div class='eventsview spcrestsync-events'><div class='item-list'><ul>";
            }
            else{
              var html = "<div class='spscrestsyncnoresults'>No results.</div>";
            }
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

            $("#"+blockid).find(".spcrestsync-content").html(html);
            
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
            html = "";
            return;
          } 
        })
      };
      html = "";
    });

    $(".spcrestsync-news").each(function(){

      var divisionid = $(this).attr("data-divisionid");
      var limit = $(this).attr("data-limit");
              
      if(!$(this).find(".spcrestsync-content").hasClass("processed")){
        $(this).find(".spcrestsync-content").addClass("processed");
        var spcblocklimit = $(this).attr("data-limit");
        var spcblockid = $(this).attr("id");
        $.ajax({
          url: 'https://www.spc.int/contentsync/news/'+divisionid+'?_format=json',
          async: false,
          method: 'GET',
          limit: spcblocklimit,
          blockid: spcblockid,
          success: function (json, status, settings) {
            
            var limit = this.limit;
            var blockid = this.blockid;
            var image = "";

            var arrayLength = json.length;
            if(arrayLength > 0){
              var html = "<div class='spcgrid updates center spcrestsync-news'><div class='kyanite-views-rows'>";
            }
            else{
              var html = "<div class='spscrestsyncnoresults'>No results.</div>";
            }
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

            $("#"+blockid).find(".spcrestsync-content").html(html);
            
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
            html = "";
            return;
          } 
        })
      };
      html = "";
    });

    $(".spcrestsync-blog").each(function(){

      var divisionid = $(this).attr("data-divisionid");
      var limit = $(this).attr("data-limit");
              
      if(!$(this).find(".spcrestsync-content").hasClass("processed")){
        $(this).find(".spcrestsync-content").addClass("processed");
        var spcblocklimit = $(this).attr("data-limit");
        var spcblockid = $(this).attr("id");
        $.ajax({
          url: 'https://www.spc.int/contentsync/webstories/'+divisionid+'?_format=json',
          async: false,
          method: 'GET',
          limit: spcblocklimit,
          blockid: spcblockid,
          success: function (json, status, settings) {
            
            var limit = this.limit;
            var blockid = this.blockid;
            var image = "";


            var arrayLength = json.length;
            if(arrayLength > 0){
              var html = "<div class='spcgrid updates center spcrestsync-blog'><div class='kyanite-views-rows'>";
            }
            else{
              var html = "<div class='spscrestsyncnoresults'>No results.</div>";
            }
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

            $("#"+blockid).find(".spcrestsync-content").html(html);
            
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
            html = "";
            return;
          } 
        })
      };
      html = "";
    });

    $(".spcrestsync-videos").each(function(){

      var divisionid = $(this).attr("data-divisionid");
      var limit = $(this).attr("data-limit");
              
      if(!$(this).find(".spcrestsync-content").hasClass("processed")){
        $(this).find(".spcrestsync-content").addClass("processed");
        var spcblocklimit = $(this).attr("data-limit");
        var spcblockid = $(this).attr("id");
        $.ajax({
          url: 'https://www.spc.int/contentsync/videos/'+divisionid+'?_format=json',
          async: false,
          method: 'GET',
          limit: spcblocklimit,
          blockid: spcblockid,
          success: function (json, status, settings) {
            
            var limit = this.limit;
            var blockid = this.blockid;
            var image = "";


            var arrayLength = json.length;
            if(arrayLength > 0){
              var html = "<div class='spcgrid updates center spcrestsync-videos'><div class='kyanite-views-rows'>";
            }
            else{
              var html = "<div class='spscrestsyncnoresults'>No results.</div>";
            }
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

            $("#"+blockid).find(".spcrestsync-content").html(html);
            
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) { 
            html = "";
            return;
          } 
        })
      };
      html = "";
    });
  

  });//end window load


}) (jQuery, Drupal, drupalSettings);