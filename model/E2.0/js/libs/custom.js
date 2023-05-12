var labelhide=false;
var initPersonal = function () {
    $("#butList").css("display","none");
    all3d.traverse(function (child) {
        if (child.material) {
            if (allmtl.hasOwnProperty(child.uuid)) {
                if(child.material.color){
                    switch (child.material.type) {
                        case 'MeshBasicMaterial':
                            child.material=new THREE.MeshBasicMaterial().copy(child.material);
                            break;
                        case 'MeshLambertMaterial':
                            child.material=new THREE.MeshLambertMaterial().copy(child.material);
                            break;
                        case 'MeshPhongMaterial':
                            child.material=new THREE.MeshPhongMaterial().copy(child.material);
                            break;
                        case 'MeshStandardMaterial':
                            child.material=new THREE.MeshStandardMaterial().copy(child.material);
                            break;
                        case 'MeshPhysicalMaterial':
                            child.material=new THREE.MeshPhysicalMaterial().copy(child.material);
                            break;
                    }
                }
                child.material.needsUpdate = true;
            }
        }
    });
    controls.autoRotate = false;
    createPersonal();
    var swiper = new Swiper('.swiper-container', {
        slidesPerView: 'auto',
        freeMode: true,
        pagination: '.swiper-pagination',
        observer: true,
        observeParents:true,
    });
    $('.UIButtonContent').css('display', 'none');
    //$('.talk_but').css('display', 'none');
    $('#perspnallist').css('display', 'block');
    if($("#spreadContainer").css("display")=='block'){
        $("#spreadContainer").hide();
        labelhide=true;
    }
    $(this).css('display', 'none');
    $(".partbut")[0].click()
};
var exitPersonal = function () {
    $("#butList").css("display","block");
    if(labelhide)$("#spreadContainer").show();
    resetP();
    all3d.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            if (child.material)
                if(child.material.color)child.material = allmtl[child.uuid];
            child.material.needsUpdate = true;
        }
    });
    $('.partbutlist').remove();
    $('.part_left').remove();
    $('.part_right').remove();
    $('.customdiv').remove();
    $('.UIButtonContent').css('display', 'block');
    $('#perspnallist').css('display', 'none')
};
var createPersonal = function () {
    //部件列
    var partbutlist = new UI.Panel().setClass('partbutlist swiper-wrapper swiper-container');
    var partlist = new UI.createDiv('partList swiper-wrapper', partbutlist, '', 'ul');
    var part_left = new UI.createDiv("part_left", document.body);
    var part_right = new UI.createDiv("part_right", document.body);
    var sPartRight=$('.part_right');

    document.getElementById("viewport").appendChild(partbutlist.dom);
    //定制内容
    var disableControl =function(){
        controls.enabled=false;
    };
    var customdiv = new UI.Panel().setClass('customdiv').setId('customdiv');
    customdiv.dom.addEventListener('mousedown', function(e){
        this.addEventListener('mousemove',disableControl);
    }, false);
    customdiv.dom.addEventListener('mouseup', function(e){
        this.removeEventListener('mousemove',disableControl);
        controls.enabled=true;
    }, false);
    partbutlist.dom.addEventListener('mousedown', function(e){
        this.addEventListener('mousemove',disableControl);
    }, false);
    partbutlist.dom.addEventListener('mouseup', function(e){
        this.removeEventListener('mousemove',disableControl);
        controls.enabled=true;
    }, false);
    customdiv.dom.style.display = "none";
    document.getElementById("viewport").appendChild(customdiv.dom);
    var pageupDiv = new UI.createDiv('pageupDiv', customdiv);
    var customDiv2=new UI.createDiv('customlist  swiper-wrapper swiper-container', customdiv);
    var customlist = new UI.createDiv('customlistContent swiper-wrapper', customDiv2, '', 'ul');
    var nextpageDiv = new UI.createDiv('nextpageDiv', customdiv);

    //上下页，手机判断
    var cindex = 0;
    var partNum=0;
    var pageup = new UI.createDiv('pageup', pageupDiv);
    var nextpage = new UI.createDiv('nextpage', nextpageDiv);
    nextpage.onClick(function () {
        if(cindex<partNum-1){
            ++cindex;
            $(".partbut")[cindex].click()
        }

    });
    pageup.onClick(function () {
        if(cindex>0){
            --cindex;
            $(".partbut")[cindex].click()
        }
    });
    var j = 0;
    var clistlength;
    all3d.traverse(function (child) {
        if (dataBaseO.personal.hasOwnProperty(child.uuid)) {
            parts[j] = createDiv('partbut swiper-slide', partlist, undefined, 'part', dataBaseO.personal[child.uuid].name);
            parts[j].setId(child.uuid);
            parts[j].dom.setAttribute("index",partNum);
            partNum++;
            parts[j].onClick(function () {
                var thisindex = parts.indexOf(this);
                cindex = this.dom.getAttribute("index");
                $('.partbut').eq(thisindex).css('opacity', 0.5).siblings().css('opacity', 1.0);
                customdiv.dom.style.display = "block";
                //相机位置
                if (dataBaseO.personal[child.uuid].Cposition !== null) {
                    new TWEEN.Tween(camera.position).to({
                        x: dataBaseO.personal[child.uuid].Cposition.x,
                        y: dataBaseO.personal[child.uuid].Cposition.y,
                        z: dataBaseO.personal[child.uuid].Cposition.z
                    }, 1500).start();

                }
                var l = $(".customcontent").length;
                for (var i = 0; i < l; i++) {
                    $(".customcontent")[0].remove();
                    $(".customcontent_div")[0].remove();
                }
                for (var i = 0; i < dataBaseO.personal[this.dom.id.toString()].ColorArray.length; i++) {
                    var cid = this.dom.id.toString() + "_" + "color" + "_" + i;
                    createDiv('customcontent', customlist, undefined, 'color', dataBaseO.personal[this.dom.id.toString()].ColorArray[i], cid);
                }
                for (var i = 0; i < dataBaseO.personal[this.dom.id.toString()].MapArray.length; i++) {
                    var mid = this.dom.id.toString() + "_" + "map" + "_" + i;
                    createDiv('customcontent', customlist, undefined, 'map', dataBaseO.personal[this.dom.id.toString()].MapArray[i], mid);
                }

                $(".customcontent").click(function () {
                    var thistype = this.id.split('_')[1];
                    var index = this.id.split('_')[2];
                    var mapindex = parseInt(this.id.split('_')[2]) + dataBaseO.personal[child.uuid].ColorArray.length;
                    switch (thistype) {
                        case "color":
                            $(".customcontent_div").eq(index).css('border-color', 'rgba(255,255,255,1)').siblings().css('border-color', 'rgba(255,255,255,0)');
                            var newcolr = dataBaseO.personal[child.uuid].ColorArray[parseInt(this.id.split('_')[2])].replace("#", "0x");
                            child.material.color.setHex(newcolr);
                            child.material.map = null;
                            break;
                        case "map":
                            $(".customcontent_div").eq(mapindex).css('border-color', 'rgba(255,255,255,1)').siblings().css('border-color', 'rgba(255,255,255,0)');
                            child.material.color.setHex(0xffffff);
                            var newmap = new THREE.TextureLoader().load(dataBaseO.personal[child.uuid].MapArray[parseInt(this.id.split('_')[2])]);
                            newmap.repeat = child.material.map.repeat;
                            newmap.wrapS=newmap.wrapT=THREE.RepeatWrapping;
                            child.material.map = newmap;

                    }
                    child.material.needsUpdate = true;
                });
                var Content = document.getElementsByClassName("customlistContent")[0];
                clistlength = Content.children.length;
                var len= clistlength*60;
                if(len< $(".customlist").width()){
                    Content.style.left="50%";
                    Content.style.marginLeft="-"+len/2+"px";
                }else{
                    Content.style.left="";
                    Content.style.marginLeft="";
                    Content.style.transform="translate3d(0px, 0px, 0px)";
                }

            });
        }
    });
};

var createDiv = function (classs, parent, Brothers, type, content, id) {
    var div;
    if (type == 'part') {
        div = new UI.createDiv(classs, parent, content, 'li');
    } else {
        div_b = new UI.createDiv('customcontent_div swiper-slide', parent);
        div = new UI.createDiv(classs, div_b, '', 'li');
    }

    div.setId(id);

    if (Brothers !== undefined && type != 'part' && !mobileDevice) {
        Brothers.dom.parentNode.insertBefore(div_b.dom, Brothers.dom);
    }
    switch (type) {
        case 'color':
            div.dom.style.backgroundColor = content;
            break;
        case 'map':
            div.dom.style.backgroundImage = "url(" + content + ")";
            break;
        case 'part':
            //div.dom.style.backgroundImage = "url(" + content + ")";
            break;
    }
    return div;
};
var PersonalBut = document.getElementById('perspnalbut');
PersonalBut.addEventListener('click', initPersonal, false);
var exitpersonal = document.getElementById("exitperspnal");
exitpersonal.addEventListener('click', exitPersonal, false);