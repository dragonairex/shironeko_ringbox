var rr=(function () {
	var rings=[
/*fav,rarity,s1,s2,s3*/
[0,0,"DEMO","",""],
[0,2,"雷属性ダメージ+20%","HP+3%","HP+3%"]
/**/
	];
	/*out sourced*/
	var effects=ringbox_source_effects;

	var baseX=40,baseY=20,oneX=75,oneY=50,onePageX=380,onePageY=200;
	var synonyms=[
		["电","電"],["屬","属"],["禦","御"],["擊","撃"],["效","効"],["火","炎"],["狀","状"],["會","会"],["獸","獣"],["氣","気"],	["絕","絶"],	["燒","焼"],	["數","数"],["攻速","攻 速"],["移速","移 速"],["跑速","移 速"]
	];
	var searchLog=[];
	return {
		skillNumber:0,
		effectLog:[],
		resetLog:function(){this.effectLog.length=0;return;},
		resetSkillNumber:function(){this.skillNumber=0;return;},
		pickEffect:function(x){
			var thisEffect=effects,parentEffect=effects;
			var output=[];
			
			for (var i=0;i<this.effectLog.length;i++) {
				parentEffect=thisEffect;
				thisEffect=thisEffect[this.effectLog[i]];
			}
			
			if (x<0) return;
			else if (x==0) {/*go back*/
				if(typeof parentEffect[1]=="string") {
					output=parentEffect;
				} else {
					output.push(parentEffect[0]);
					for (var i=1;i<parentEffect.length;i++) {
							output.push(parentEffect[i][0]);
						}
				}
				if (this.effectLog.length>0) this.effectLog.length-=1;
				else this.resetLog();
			}
			else {/*x>0*/
				this.effectLog.push(x);
				
				if (typeof thisEffect[x] =="string") {
					if(thisEffect[1].length>0) output.push(thisEffect[0]+thisEffect[x]);
					else output.push(thisEffect[x]);
				} else {
					if (typeof thisEffect[x][1] =="string") {
						output=thisEffect[x];
					} else {
						output.push(thisEffect[x][0]);
						for (var i=1;i<thisEffect[x].length;i++) {
							output.push(thisEffect[x][i][0]);
						}
					}
				}
			}
			return (output);
		},
		importRings:function(x){
			x=x.replace(/,\s*$/, '').replace(/[\n\s\t]/g,'').replace(/'/g,"\"");
			var y;
			try{
				y=JSON.parse('['+x+']');
			}catch(e){
				alert("import unsuccessful");return;
			}
			var tem=0;
			try {
				tem=y.length;
			} catch(e) {
				alert("import unsuccessful");return;
			}
			//if (tem<=0){alert("import unsuccessful");return;}
			if (typeof y[0]=='object'&&$.isArray(y[0])) {
				var corruptPrompt=1;
				for (var i=0;i<tem;i++) {
					var health=0;
					if (typeof y[i]=='object'&&$.isArray(y[i])) {
						var temp=0;
						try {
							temp=y[i].length;
						} catch(e) {
							alert("import unsuccessful");return;
						}
						if (temp>=5) {
							if (typeof y[i][0]=='number')health++;
							if (typeof y[i][1]=='number')health++;
							if (typeof y[i][2]=='string'){y[i][2]=y[i][2].replace(/,/g,'');health++;}
							if (typeof y[i][3]=='string'){y[i][3]=y[i][3].replace(/,/g,'');health++;}
							if (typeof y[i][4]=='string'){y[i][4]=y[i][4].replace(/,/g,'');health++;}
							if (temp>5) y[i]=y[i].slice(0,5);
						}
					}
					if (health<5) {
						if(corruptPrompt){
							var cc=confirm("some fields are corrupted\ncontinue?");
							if (cc) {
								corruptPrompt=0;
							} else {
								return;
							}
						}
						y[i]=[0,0,"","",""];
					}
				}
			} else {
				alert("import unsuccessful");return;
			}
			rings.length=0;
			rings=y;
			
			var $ringPages=$("#ringPages");
			$ringPages.empty();
			$ringPages.append('<div class="ringPage"><span><b>1</b>/<span>1</span></span></div>');
			this.skillNumber=0;
			this.resetLog();
			this.numberOfPages=1;
			this.ordering=0;
			this.currentRing=-1;
			this.highlighted=-1;
			this.currentEditing=-1;
			
			this.printRings();
			
			$("#search").val('');
			$("#addS1").val('');
			$("#addS2").val('');
			$("#addS3").val('');
			$("#ringId").val('');
			$("input:radio[name='rarity']").prop("checked",false);
			$("#currentRarity").removeClass();
			
			var xx=confirm("import finished\nsave now?");
			if (xx)
				this.storeAllRings();

			/*this.init();*/
			return;
		},
		exportRings:function(){
			var output='';
			for (var i=0;i<this.getNumberOfRings();i++) {
				if(output) output+=',\n';
				output+='[';
				var thisItem='';
				for (var j=0;j<rings[i].length;j++) {
					if(thisItem) thisItem+=',';
					if (typeof rings[i][j]=="string") thisItem+='"';
					thisItem+=rings[i][j];
					if (typeof rings[i][j]=="string") thisItem+='"';
				}
				output+=thisItem+']';
			}
			return (output);
		},
		getNumberOfRings:function(){return rings.length},
		getRing:function(x){
			return {rarity:rings[x][1],fav:rings[x][0],skill1:rings[x][2],skill2:rings[x][3],skill3:rings[x][4]};
		},
		addRing:function(x){
			var newRing=[0,parseInt(x[0]),x[1].replace(/,/g,''),x[2].replace(/,/g,''),x[3].replace(/,/g,'')];
			var l=x.length;
			if (l==4){
				rings.push(newRing);
				this.highlighted=this.getNumberOfRings()-1;
			} else if (l==6){
				var p=parseInt(x[4]);
				var n=parseInt(x[5]);
				var totalRings=this.getNumberOfRings();
				var index;
				var a=(p-1)*12+(n-1);
				if (a>totalRings) a=totalRings;
				if (this.ordering) index=totalRings-a;
				else index=a;
				rings.splice(index, 0, newRing);
				this.highlighted=index;
			}
			this.printRings();
			this.storeAllRings();
		},
		editRing:function(id,fav,r,s1,s2,s3){
			rings[id]=[parseInt(fav),parseInt(r),s1.replace(/,/g,''),s2.replace(/,/g,''),s3.replace(/,/g,'')];
			
			this.storeAllRings();
			
			this.clearSearch();
			this.highlighted=id;
			this.printRings();
		},
		picker:function(x){
			var effectsList=rr.pickEffect(x);
			var $effectPicker=$("#effectPicker");
			if($effectPicker) {
				$effectPicker.empty();
				if(effectsList.length==1) {return(effectsList[0]);}
				
				$effectPicker.append('<button id="cancelButton">X</button>');
				if (rr.effectLog.length>0) $effectPicker.append('<button id="backButton" class="pickButton" data-num=0>back</button>');
				$effectPicker.append('<span>'+effectsList[0]+'</span>');
				for (var i=1;i<effectsList.length;i++) {
					if (effectsList[i].length>0)/*ommit empty property*/
						$effectPicker.append('<button class="pickButton effectPick" data-num='+i+'>'+effectsList[i]+'</button>');
				}
				if (rr.effectLog.length==0 && $("#addS"+this.skillNumber).val()) $effectPicker.append('<button id="clearButton" class="effectPick">clear</button>');
			}
		},
		numberOfPages:1,
		ordering:0,
		currentRing:-1,
		printRings:function(){
			var x=this.ordering;
			if($("#rings")) {
				var $rings=$("#rings");
				$("#popup").removeClass("show");
				$("#ringCover").addClass("show");
				/*add page if needed*/
				if($("#ringPages")) {
					var $ringPages=$("#ringPages");
					var shouldBeTotalPages=Math.floor((this.getNumberOfRings()-1 )/12)+1;
					while(this.numberOfPages<shouldBeTotalPages) {
						this.numberOfPages++;
						$ringPages.append('<div class="ringPage"><span><b>'+this.numberOfPages+'</b>/<span></span></span></div>');
					}
				}
				$(".ringPage span span").text(this.numberOfPages);
				
				$rings.empty();
				
				var ii=0,increment=1;
				/*x=1:reverse*/
				if (x) {ii=this.getNumberOfRings()-1;increment=-1;}

				/*listView*/
				var lv=$("#listContainer");
				lv.empty();
				var isSearch=0;
				if(searchLog.length>0&&searchLog.reduce(function(a,b){return (a+b);})>0)isSearch=1;

				for (var i=0;i<this.getNumberOfRings();i++) {
				
					var thisRing=this.getRing(ii);
					var pageNum=(Math.floor(i/12));
					var thisX=baseX+((Math.floor(i/3))%4)*oneX+(pageNum%2)*onePageX;
					var thisY=baseY+(i%3)*oneY+(Math.floor(pageNum/2))*onePageY;
					var fav=thisRing.fav?" fav":"";
					var searched='';
					if (searchLog.length>=ii)searched=searchLog[ii]?" searched":"";
					var highlight=((this.highlighted==ii)?" highlighted":"");
					$rings.append('<div class="ring rarity'+thisRing.rarity+''+fav+''+highlight+''+searched+'"'
						+' style="left:'+thisX+'px;top:'+thisY+'px;"'
						+' data-id="'+ii+'"'
						/*+'" data-page="'+(Math.floor((ii)/12)+1)
						+'" data-ban="'+(ii%12+1)
						+'" data-skill1="'+thisRing.skill1
						+'" data-skill2="'+thisRing.skill2
						+'" data-skill3="'+thisRing.skill3+*/
						+'/>');

					/*listView*/
					if(!isSearch) {
						if (i%12==0) lv.append('<div class="listPageHead"><span>頁'+(Math.floor(i/12)+1)+'</span></div>');
						lv.append('<ul class="listViewRing rare'+thisRing.rarity+'">'
							+'<li>'+thisRing.skill1+'</li>'
							+'<li>'+thisRing.skill2+'</li>'
							+'<li>'+thisRing.skill3+'</li>'
							+'</ul>');
					} else {
						if(searchLog[ii]) {
							var x=this.getPageAndPosition(ii);
							lv.append('<div><div class="listPageHead"><span>頁'+x.page+'#'+x.position+'</span>'
								+'<button class="hideResult"></button></div>'
								+'<ul class="listViewRing rare'+thisRing.rarity+'">'
								+'<li>'+thisRing.skill1+'</li>'
								+'<li>'+thisRing.skill2+'</li>'
								+'<li>'+thisRing.skill3+'</li>'
								+'</ul></div>');
						}
					}

					ii+=increment;
				}
				if(isSearch) {
					lv.append("<div/>");
				}
				this.highlighted=-1;
				$("#addButton>span").text(this.getNumberOfRings());
				$("#ringCover").removeClass();
			}
			return;
		},
		currentEditing:-1,
		getPageAndPosition:function(x){
			var y;
			if (this.ordering) y=this.getNumberOfRings()-x-1;
			else y=x;
			return({page:(Math.floor((y)/12)+1),position:(y%12+1)});
		},
		popup:function(){
			x=this.currentRing;
			var $popup=$("#popup");
			$popup.empty();
			var thisRing=this.getRing(x);
			var pp=this.getPageAndPosition(x);

			$popup.append('<u>&nbsp;頁'+pp.page+'#'+pp.position+'&nbsp;</u>');
			$popup.append('<button id="deleteButton" data-id="'+x+'">削除</button>'
						 +'<button id="editButton" data-id="'+x+'">編集</button>'
						 +'<button id="favButton" data-id="'+x+'">'+(thisRing.fav?"♡":"♥")+'</button>'
						 +'<br/><br/>');
			$popup.append('<ul><li>・'+thisRing.skill1+'</li><li>・'+thisRing.skill2+'</li><li>・'+thisRing.skill3+'</li></ul>');
			return;
		},
		recentDeleted:[],
		deleteRing:function(x){
			this.recentDeleted=rings.splice(x, 1);
			
			this.storeAllRings();
			
			this.clearSearch();
			var remain=this.getNumberOfRings();
			if(remain!=0&&remain%12==0) {
				$(".ringPage:last-child").remove();
				this.numberOfPages--;
			}
			this.printRings();
			return;
		},
		favRing:function(x){
			var y=rings[x][0];
			rings[x][0]=y?0:1;
			
			this.storeAllRings();
			
			this.highlighted=x;
			this.printRings();
			return;
		},
		highlighted:-1,
		clearSearch:function(){
			searchLog.length=0;
			$("#resultText").text("");
			return;
		},
		search:function(){
			this.clearSearch();
			x=$("#search").val();
			if (x) {
				var strict=["SP","攻撃"];
				var query=[];

				x=$('<div/>').text(x).text();
				
				/*replace synonyms*/
				for (var i=0;i<synonyms.length;i++) {
					x=x.replace(synonyms[i][0],synonyms[i][1]);
				}
				
				var y=x.toUpperCase().replace(/\s+/g," ").split(" ");
				/*up to 9 parameters*/
				if (y.length>9) y=y.slice(0,9);
				//var z=y[0];
				for (var i=0;i<y.length;i++) {
					var object,tt,tt1,tt2,operator='',number=null;
					var posOfOperator=y[i].search(/[<>=+-\d]/);
					if(posOfOperator>-1){
						object=y[i].slice(0,posOfOperator);
						tt=y[i].match(/[<>=+-\d]+/);
						if (tt) {
							tt1=tt[0].match(/(<=|>=|=<|=>|=|<|>)/);
							tt2=tt[0].match(/[+-]?\d+/);
						}
						if (tt1) operator=tt1[0].replace("<=","<").replace("=<","<").replace(">=",">").replace("=>",">");
						if (tt2) number=parseInt(tt2[0]);

					} else {
						object=y[i];
					}
					query.push([object,operator,number]);
					
				}
				/*group queries*/
				for (var i=0;i<query.length;i++){
					if ((i+1)<query.length) {
						var left=query[i];
						var right=query[i+1];
						
						if (left[2]!=null && !right[0]) {
							var o0=left[0];
							var o1='';
							if (right[1]) o1=right[1]; else o1=left[1];
							var o2=right[2];
							
							query.splice(i+1,1);
							query[i]=[o0,o1,o2];
							i--;/*re-group this entry if combined*/
						}
					}
				}
				
				for (var i=0;i<this.getNumberOfRings();i++){
					var thisRing=this.getRing(i);
					var s1=thisRing.skill1;
					var s2=thisRing.skill2;
					var s3=thisRing.skill3;

					var s=[s1,s2,s3];
					var q=[];
					for (var k=0;k<s.length;k++){
						while(s[k].length>0){
							var w1,w2;
							if(s[k].search(/\D*\d+%?/)>=0) {
								w1=s[k].match(/\D*\d+%?/)[0];
								w2=s[k].slice(w1.length);
								
								if(w2.length>0)
									s[k]=w2;
								else s[k]='';
							}else {
								w1=s[k];
								s[k]='';
							}
							q.push(w1);
						}
					}
					var words=s1+",,"+s2+",,"+s3;
					var equals=[];
					var ranges=[];
					for (var k=0;k<q.length;k++) {
						var v0=q[k].search(/[+-]?\d+/);
						if(v0>=0) {
							var v1=q[k].match(/[+-]?\d+/)[0];
							var v2=q[k].slice(0,v0);
							if (v1.search(/[+-]/)>=0) {
								/*range*/
								var ifExistRange=$.inArray(v2, ranges.map(function(mapVar){return(mapVar[0]);}));
								if(ifExistRange>=0){
									ranges[ifExistRange][1]+=parseInt(v1);
								} else { 
									ranges.push([v2,parseInt(v1)]);
								}
							}
							equals.push([v2,parseInt(v1)]);
						}
					}
					
					var passedAll=1;
					for (var k=0;k<query.length && passedAll;k++) {
						var passedThis=0;
						var thisQuery=query[k];
						if(thisQuery[2]==null) {
							/*word match*/
							if(words.indexOf(thisQuery[0])>=0){
								passedThis=1;
							}
						} else if(thisQuery[1]==">" || thisQuery[1]=="<") {
							/*range*/
							for (var n=0;n<ranges.length && !passedThis;n++) {
								if (!thisQuery[0] || $.inArray(thisQuery[0],strict)==-1 && ranges[n][0].indexOf(thisQuery[0])>=0 || $.inArray(thisQuery[0],strict)>=0 && ranges[n][0]==thisQuery[0] ) {
									if(thisQuery[1]==">") {
										if(thisQuery[2]<=ranges[n][1]) passedThis=1;
									} else {
										if(thisQuery[2]>=ranges[n][1]) passedThis=1;
									}
								}
							}
						} else {
							/*equal*/
							for (var n=0;n<equals.length && !passedThis;n++) {
								if (!thisQuery[0] || $.inArray(thisQuery[0],strict)==-1 && equals[n][0].indexOf(thisQuery[0])>=0 || $.inArray(thisQuery[0],strict)>=0 && equals[n][0]==thisQuery[0] ) {
									if(thisQuery[2]==equals[n][1] || !thisQuery[0] && thisQuery[2]>0 && thisQuery[2]==((equals[n][1])*-1) ) passedThis=1;
								}
							}
							for (var n=0;n<ranges.length && !passedThis;n++) {
								if (!thisQuery[0] || $.inArray(thisQuery[0],strict)==-1 && ranges[n][0].indexOf(thisQuery[0])>=0 || $.inArray(thisQuery[0],strict)>=0 && ranges[n][0]==thisQuery[0] ) {
									if(thisQuery[2]==ranges[n][1] || !thisQuery[0] && thisQuery[2]>0 && thisQuery[2]==((ranges[n][1])*-1) ) passedThis=1;
								}
							}
						}
						if (passedThis) passedAll=1;
						else passedAll=0;
					}
					if (passedAll) {
						searchLog.push(1);
					} else {
						searchLog.push(0);
					}
				}
				
				var numberOfResults=searchLog.reduce(function(a,b){return (a+b);});
				var queryString='';
				for (var i=0;i<query.length;i++) {
					queryString=queryString + query[i][0] + query[i][1] + (query[i][2]!=null?query[i][2]:"") + " ";
				}
				$("#resultText").text("検索: "+queryString+" ("+numberOfResults+")");

			} else {
				$(".rings").removeClass("searched");
				$("#resultText").text("");
			}
			this.printRings();
		},
		toggleBMode:function(x){
			if (x) $("#container").toggleClass("browseMode",false);
			else $("#container").toggleClass("browseMode");
			$("#popup").removeClass("show");
		},
		storeAllRings:function(){
			if(typeof(Storage) !== "undefined") {
				localStorage.setItem("myRings", rings);
			}
			return;
		},
		resetPosOption:function(){
			var $addPos=$("#addPos");
			$addPos.removeClass("changePos");
			$addPos.children("select").empty();
			$addPos.children("select").not('#addPosOption').remove();
		},
		init:function(){
			
			if(typeof(Storage) !== "undefined") {
				var a=localStorage.getItem("myRings");
				if (!!a) {
					var b=a.split(",");
					var rrr=[];
					for(var i=0;i<b.length;i+=5) {
						var temp=[];
						temp.push(parseInt(b[i]),parseInt(b[i+1]),b[i+2],b[i+3],b[i+4]);
						rrr.push(temp);
					}
					rings=rrr;
				}
			}
			
			var $ringPages=$("#ringPages")
			$ringPages.empty();
			$ringPages.append('<div class="ringPage"><span><b>1</b>/<span>1</span></span></div>');
			this.printRings();
			$("#search").val('');
			$("#addS1").val('');
			$("#addS2").val('');
			$("#addS3").val('');
			$("#ringId").val('');
			$("#oo").val('');
			$("input:radio[name='rarity']").prop("checked",false);
			$("#currentRarity").removeClass();
			return;
		}
	};
})();
$(document).ready(function (){
    $("#updatedOn").text(ringbox_source_updatedOn);
	rr.init();
	$("#ringBox").on("click",function(){/*potential error*/
		$(".ring.clicked").removeClass("clicked");
		$("#popup").removeClass("show");
		rr.currentRing=-1;
	});
	$("#rings").on("click",".ring",function(event){
		event.stopPropagation();
		var $thisRing=$(this);
		$(".ring").removeClass("clicked highlighted").removeClass("");
		$thisRing.removeClass("highlighted");
		$thisRing.addClass("clicked");
		rr.currentRing=$thisRing.data("id");
		rr.popup();
		$("#popup").addClass("show");
		$("#popup").css({"left":($thisRing.offset().left+58)+"px","top":($thisRing.offset().top-$("#popup").height())+"px"});
	});
	$("#ee").on("click",function(){
		$("#oo").val(rr.exportRings());
	});
	$("#ii").on("click",function(){
		var cc = confirm("importing will overwrite existing rings\ncontinue?");
		if (cc) {
			rr.importRings($("#oo").val());
		}
	});
	$("#dd").on("click",function(){
		var cc = confirm("this will delete all data from local storage\ncontinue?");
		if (cc) {
			localStorage.removeItem("myRings");
			location.reload(); 
		}
	});
	$("#addButton").on("click",function(){
		if (rr.getNumberOfRings()==320)
			if(!confirm("adding this ring will exceed in-game limits\ncontinue?")) return;
		var selects=$("#addPos").children("select");
		if(!parseInt($(selects[0]).val()))
			rr.addRing([$("input:radio[name='rarity']:checked").length?$("input:radio[name='rarity']:checked").val():0,$("#addS1").val(),$("#addS2").val(),$("#addS3").val()]);
		else
			rr.addRing([$("input:radio[name='rarity']:checked").length?$("input:radio[name='rarity']:checked").val():0,$("#addS1").val(),$("#addS2").val(),$("#addS3").val(),$(selects[0]).val(),$(selects[1]).val()]);
		rr.resetPosOption();
		$("#addS1").val('');
		$("#addS2").val('');
		$("#addS3").val('');
		$("input:radio[name='rarity']").prop("checked",false);
		$("#currentRarity").removeClass();
	});
	$("#saveButton").on("click",function(){
		var x=parseInt($("#ringId").val());
		rr.editRing(x,$("#favId").val(),$("input:radio[name='rarity']:checked").length?$("input:radio[name='rarity']:checked").val():0,$("#addS1").val(),$("#addS2").val(),$("#addS3").val());
		$("#addS1").val('');
		$("#addS2").val('');
		$("#addS3").val('');
		$("#favId").val(0);
		$("#skillEditor>span").text("");
		rr.currentEditing=-1;
		rr.resetPosOption();
		$("input:radio[name='rarity']").prop("checked",false);
		$("#currentRarity").removeClass();
		var $skillEditor=$("#skillEditor");
		$skillEditor.removeClass("editMode");
		$skillEditor.addClass("addMode");
	});
	$("#stopButton").on("click",function(){
		$("#addS1").val('');
		$("#addS2").val('');
		$("#addS3").val('');
		$("#ringId").val('');
		$("#skillEditor>span").text("");
		$("input:radio[name='rarity']").prop("checked",false);
		$("#currentRarity").removeClass();
		var $skillEditor=$("#skillEditor");
		$skillEditor.removeClass("editMode");
		$skillEditor.addClass("addMode");
		rr.currentEditing=-1;
		rr.resetPosOption();
		$("#effectPicker").empty();
		rr.resetLog();
		$(".skillx3").removeClass("picking");
		rr.resetSkillNumber();
	});
	$(".startPickButton").on("click",function(){
		var whichSkill=parseInt($(this).attr("id").replace("pick",""));
		rr.skillNumber=whichSkill;
		rr.resetLog();
		rr.picker(0);
		$(".skillx3").removeClass("picking");
		$("#addS"+whichSkill+"").addClass("picking");
	});
	$("#effectPicker").on("click",".pickButton",function(){
		var effectNumber=parseInt($(this).data("num"));
		var result=(rr.picker(effectNumber));
		if (result){
			//console.error(rr.skillNumber+":"+result); /*GUILD OFFER CANT SEE*/
			$("#addS"+rr.skillNumber+"").val(result);
			rr.resetLog();
			$(".skillx3").removeClass("picking");
			rr.resetSkillNumber();
		}
	});
	$("#effectPicker").on("click","#cancelButton",function(){
		$("#effectPicker").empty();
		rr.resetLog();
		$(".skillx3").removeClass("picking");
		rr.resetSkillNumber();
	});
	$("#effectPicker").on("click","#clearButton",function(){
		$("#effectPicker").empty();
		$("#addS"+rr.skillNumber+"").val("");
		rr.resetLog();
		$(".skillx3").removeClass("picking");
		rr.resetSkillNumber();
	});
	$("#reverseOrder").on("click",function(){
		$("#popup").removeClass("show");
		rr.ordering?rr.ordering--:rr.ordering++;
		rr.clearSearch();
		if (rr.currentEditing>=0){
			var pp=rr.getPageAndPosition(rr.currentEditing);
			$("#skillEditor>span").text(" 頁"+pp.page+"#"+pp.position);
			rr.highlighted=rr.currentEditing;
		}
		rr.printRings();
		rr.resetPosOption();
		$(this).text(rr.ordering?"▼ 降順":"▲ 昇順");
	});
	$("#currentRarity").on("click",function(){
		$(this).removeClass();
	});
	$("input:radio[name='rarity']").on("click",function(){
		var x=parseInt($("input:radio[name='rarity']:checked").val());
		$("#currentRarity").addClass("rare"+x+"");
	});
	$("#popup").on("click","#favButton",function(){
		var x=parseInt($(this).data("id"));
		rr.favRing(x);
	});
	$("#popup").on("click","#deleteButton",function(){
		var x=parseInt($(this).data("id"));
		var thisRing=rr.getRing(x);
		var pp=rr.getPageAndPosition(x);
		var cc = confirm("頁"+pp.page+"#"+pp.position+"\n・"+thisRing.skill1+"\n・"+thisRing.skill2+"\n・"+thisRing.skill3+"\nこのアクセを削除しますか？");
		if (cc) {
			rr.deleteRing(x);
			rr.resetPosOption();
		}
	});
	$("#popup").on("click","#editButton",function(){
		var x=parseInt($(this).data("id"));
		var thisRing=rr.getRing(x);
		rr.currentEditing=x;
		rr.resetPosOption();
		$("#currentRarity").addClass("rare"+thisRing.rarity+"");
		$("#rr"+thisRing.rarity+"").prop("checked", true);
		$("#addS1").val(thisRing.skill1);
		$("#addS2").val(thisRing.skill2);
		$("#addS3").val(thisRing.skill3);
		$("#favId").val(thisRing.fav);
		$("#ringId").val(x);
		$(".ring").removeClass("highlighted");
		var pp=rr.getPageAndPosition(x);
		$("#skillEditor>span").text(" 頁"+pp.page+"#"+pp.position);
		var $skillEditor=$("#skillEditor");
		$skillEditor.removeClass("addMode");
		$skillEditor.addClass("editMode");
		rr.toggleBMode(1);
		rr.clearSearch();
	});
	$("#searchButton").on("click",function(){rr.search();});
	$("#search").on("input",function(){rr.search();});
	$("#bModeButton,#aModeButton").on("click",function(){rr.toggleBMode(0);});
	$("#addPosOpen").on("click",function(){
		var $addPos=$("#addPos");
		$addPos.addClass("changePos");
		var a=$addPos.children("#addPosOption");
		$(a).append("<option value='' disabled selected>頁</option>");
		for (var i=1;i<=rr.numberOfPages;i++)
			$(a).append("<option value="+i+">頁"+i+"</option>");
		$(a).append("<option value=0>最新</option>");
	});
	$("#addPosOption").on("change",function(){
		var $addPos=$("#addPos");
		var $addPosOption=$(this);
		if (parseInt($addPosOption.val())) {
			if ($addPos.children("select").length<2){
				var a=$("<select></select>");
				for (var i=1;i<=12;i++)
					a.append("<option value="+i+">#"+i+"</option>");
				$addPos.append(a);
			}
		} else {rr.resetPosOption()};
	});
	$("#listViewButton").on("click",function(){
		$("#container").toggleClass("listView");
		$("#popup").removeClass("show");
		rr.currentRing=-1;
	});
	$("#listContainer").on("click",".hideResult",function(){
		$listContainer=$("#listContainer");
		$(this).parent().parent().hide();
		$listContainer.children(":last").remove();
		$listContainer.append('<div style="text-align:center">- there are hidden results. search again to show -</div>');
	});
});