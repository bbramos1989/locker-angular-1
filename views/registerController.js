lockerweb.controller("CtrlRegister", function($scope,UserRegisterService,$rootScope,$state) {
	$scope.dataRegister = {};  

    // $('.register').baron();
    
    //CROPPED IMAGE     
    $scope.myImage = "";
    $scope.myCroppedImage = ''; // in this variable you will have dataUrl of cropped area.
    console.log("$scope.myCroppedImage", $scope.myCroppedImage);
    $scope.myFile = ""; 

    $scope.upload = function(file){    
        $scope.myImage = file;
        $("#myModal").modal('show');
    }
    $scope.sendImage = function(){
        console.log("$scope.myCroppedImage", $scope.myCroppedImage);
        var base64 = $scope.myCroppedImage.split(",");
        console.log("base64", base64);

        var result = base64[base64.length - 1];
        console.log("result", result);
    
        var blob = $rootScope.b64toBlob(result, "image/jpg");
        console.log("blob", blob);
        $scope.myFile = $rootScope.blobToFile(blob, "my-image.jpg");
        console.log("myFile", $scope.myFile);

        $scope.dataRegister.avatar = $scope.myFile;          
    }
    //CROPPED IMAGE (FUNCTION IN MASTER CONTROLLER) 

    //MASK
    $('#date-register').mask("99/99/9999");
    $('.telefone').mask('(99) 9999-99999');
  
    //SERVICE REGISTER
	$scope.registerForm = function(){  

        //CONVERT DATE      
        var dateVal = $('#date-register').val().split("/");              
        var dateFormat = moment(dateVal[2]+'-'+dateVal[1]+'-'+dateVal[0]).format('YYYY-MM-DD'); 

        console.log(dateFormat);

        if(dateFormat == "Invalid date"){           
            swal("Data inválida!","Por favor, insira uma data válida.","error")
        }else{

            //CONVERT PHONE
            $('.telefone').unmask();
            var newPhone = $('.telefone').val();   

            var dataParams = new FormData();
            dataParams.append('avatar', $scope.dataRegister.avatar, 'avatar.jpg');
            dataParams.append('name', $scope.dataRegister.name);
            dataParams.append('username', $scope.dataRegister.username);        
            dataParams.append('email', $scope.dataRegister.email);
            dataParams.append('conf_email', $scope.dataRegister.conf_email);
            dataParams.append('password', $scope.dataRegister.password);
            dataParams.append('conf_password', $scope.dataRegister.conf_password);        
            dataParams.append('birthdate', dateFormat);
            dataParams.append('phone_number', newPhone);

            UserRegisterService.register(dataParams, function(data){
                if(data.status == "success"){
                    swal({
                      title: "Usuário criado com sucesso!",
                      text: "Foi enviado um link de confirmação para o seu email!",
                      type: "success",
                      confirmButtonText: "Ok",
                      confirmButtonColor: "#2a9fd5"
                    });
                $state.go("login");
                }else{                
                    for(var k in data.data){
                        swal("Ops!", data.data[k], "error");                    
                    }
                    $('.telefone').mask('(99) 9999-99999');
                }
            });
        }      
    };
    
}).service(
    'UserRegisterService', [
    '$rootScope',
    '$http',
    function($rootScope, $http) {
        var service = this;
        service.req = {
            url : null,
            method : 'post',
            headers: {
                'Content-Type': undefined
            },
            data: "" 
        };
        service.register = function(params,callback){
            service.req.url = $rootScope.urlRoute + "/user/register";
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
