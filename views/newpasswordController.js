lockerweb.controller("CtrlNewPassword", function($state, $location, $scope,NewPasswordService, $stateParams, $rootScope) {
		
	$scope.token = $stateParams.token;
	$scope.email = $stateParams.user;


	console.log("oio", $scope.token);

	$scope.formNewPassword = function(){
		var dataParams = new FormData();
		dataParams.append('conf_password', $scope.confirmPassword);
		dataParams.append('password', $scope.password);
		dataParams.append('activate_code', $scope.token);
		dataParams.append('email', $scope.email);
		NewPasswordService.newPassword(dataParams, function(response){
			console.log("response", response);
			if(response.status == "success"){
            swal({
                  title: "",
                  text: "Senha atualizada!",
                  type: "success",
                  confirmButtonText: "Ok",
                  confirmButtonColor: "#2a9fd5"
                });
            $state.go("login");    
	        }else{                
	            swal("", "Não foi possível atualizar sua senha!", "error");                    
	        }	
		});
	};
}).service(
'NewPasswordService', [
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
	    service.newPassword  = function(params, callback, position){
	        service.req.headers['Access-Token'] = $rootScope.token;
	        service.req.url = $rootScope.urlRoute + "/User/RedefinePassword";
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