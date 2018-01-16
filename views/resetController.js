lockerweb.controller("CtrlresetPassword", function($rootScope, $scope, $state, changePassword) {
    // OBJECT DATA RESET PASSWORD
	$scope.dataChangePass = {}; 

    // FUNCTION CHANGE PASSWORD
    $scope.changePassword = function(){

        // FORMDATA CHANGE PASSWORD
        var dataChangePassword = new FormData();        
        dataChangePassword.append('actual_password', $scope.dataChangePass.currentPass);
        dataChangePassword.append('password', $scope.dataChangePass.newPass);
        dataChangePassword.append('conf_password', $scope.dataChangePass.confNewPass);

        // SERVICE CHANGE PASSWORD
        changePassword.changePassword(dataChangePassword, function(response){
            if(response.status == "success"){
                swal({
                  title: "Alterada",
                  text: "Senha alterada com sucesso!",
                  type: "success",
                  confirmButtonText: "Ok",
                  confirmButtonColor: "#2a9fd5"
                });
                $state.go("login");
            }else{                
                for(var k in response.data){
                    swal("Ops!", response.data[k], "error");                    
                }
            }
        });
    };
}).service(
    'changePassword', [
    '$rootScope',
    '$http',
    function($rootScope, $http) {
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
        // PARAMS = actual_password, password, conf_password;
        service.changePassword = function(params, callback){
            service.req.url = $rootScope.urlRoute + "/user/changepassword";
            service.req.headers['Access-Token'] = $rootScope.token;
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
