lockerweb.controller("CtrlProfile", function(EditProfileService, $rootScope, $scope, MasterService) {
    $scope.showEdit = false;
    // ME ATUALIZAR
    $scope.dataUser = {
        'id': $rootScope.me.id,
        'name': $rootScope.me.name,
        'tel': $rootScope.me.phone_number,
        'email': $rootScope.me.email,
        'avatar': $rootScope.me.avatar
    };

    // EDIT AVATAR
    $scope.myImage = "";
    $scope.myCroppedImage = ''; // in this variable you will have dataUrl of cropped area.
    $scope.myFile = ""; 

    console.log('$rootScope.me', $rootScope.me);

    $scope.upload = function(file){    
        $scope.myImage = file;
        $("#myModal").modal('show');        
    };
    // $('#phone-profile').mask('(00) 00000-0000');

    // ENABLE EDITION PERFIL
    $scope.clickEdit = function (){
        $scope.showEdit = true;
    };    

    // FUNCTION EDIT IMAGE
    $scope.editImage = function(){ 
        console.log("entrou no editImage");
        var base64 = $scope.myCroppedImage.split(",");
        var result = base64[base64.length - 1];
        var blob = $rootScope.b64toBlob(result, "image/jpg");
        $scope.myFile = $rootScope.blobToFile(blob, "my-image.jpg");
        $scope.dataUser.avatar = $scope.myCroppedImage;
        //CROPPED IMAGE (FUNCTION IN MASTER CONTROLLER)
    };

    // FUNCTION EDIT PROFILE 
    $scope.editProfile = function(){   
        // FORMDATA CHANGEDATAUSER
        var paramsChangeDataUser = new FormData();          
        paramsChangeDataUser.append('id', $scope.dataUser.id);
        if($scope.myFile != ""){
            paramsChangeDataUser.append('avatar', $scope.myFile, 'avatar.jpg');
        }else{
            paramsChangeDataUser.append('avatar', $scope.myFile);
        }
        paramsChangeDataUser.append('name', $scope.dataUser.name);
        paramsChangeDataUser.append('phone_number', $scope.dataUser.tel);

        EditProfileService.changeDataUser(paramsChangeDataUser, function(response){                     
            console.log("response edit profile", response);
            if(response.status == "success"){               
                MasterService.userMe(function(response){
                    console.log("response userMe", response);
                    localStorage.setItem("me", JSON.stringify(response.data));
                    $rootScope.me = JSON.parse(localStorage.getItem("me"));
                }); 
            }else{

            }
        });
        $scope.showEdit = false;
    };
    // $('#phone_number').mask('(00) 00000-0000');    
}).service(
    'EditProfileService', [
    '$rootScope',
    '$http',
    function($rootScope, $http){
        var service = this;
        service.req = {
            url : null,
            method : 'post',
            headers: {
                'Content-Type': undefined,
                'Access-Token' : $rootScope.token
            },
            data: ""
        };
        // SERVICE CHANGE DATA USER - PARAMS = name, phone_number, id, avatar
        service.changeDataUser = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/User/EditProfile";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
    }
]);	