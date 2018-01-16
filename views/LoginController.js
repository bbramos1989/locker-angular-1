lockerweb.controller('CtrlLogin', function($scope,$rootScope, LoginService, ChannelService, MasterService,SQLService, $state){
    $scope.dataLogin = {};
    $scope.password = false;
    $rootScope.login = true;
    // if(localStorage.getItem('token')){
    //     MasterService.userMe(function(data){         
    //         localStorage.setItem("me", JSON.stringify(data.data));
    //         $rootScope.me = JSON.parse(localStorage.getItem("me"));
    //         $state.go('channels');
    //     });      
    // }
    
    angular.element(document.querySelector( '#some-id' )).show();
    $scope.login = function(){
        var dataParams = new FormData();
        dataParams.append('email', $scope.dataLogin.email);
        dataParams.append('password', $scope.dataLogin.password);
        dataParams.append('uuid', $rootScope.uuID);
        LoginService.login(dataParams, function(response){            
            if(response.status == "success"){ 
                $(document).ready(function(){
                    $("#nav-menu").show();
                });
                localStorage.setItem("token", response.token);
                $rootScope.token = response.token;
                MasterService.userMe(function(response){
                    $scope.bringPropagand();
                    $scope.hasTerm = response.data.has_term;           
                    if(response.data.avatar == "" || response.data.avatar == null){
                        response.data.avatar = "assets/img/contact-default.png";                                            
                    }                              
                    localStorage.setItem("me", JSON.stringify(response.data));
                    $rootScope.me = JSON.parse(localStorage.getItem("me"));
                    localStorage.setItem("channelId", "0");
                    SQLService.init(response.data);
                    if($scope.hasTerm == true){
                        $state.go("aceitartermo");     
                    }else{
                        $state.go("channels", {id:"0"});
                    }
                });
             }else{
                switch(response.message) {
                    case "Necessario ativar a conta":
                        swal({title:"Sua conta ainda não foi ativada. Para ativar, acesse seu email e informe o código de ativação"})
                        $state.go("activateuser")
                        break;
                    case "Conta deletada":
                        swal({
                            title: "Conta desativada",
                            text: "Essa conta foi desativada, você deseja reativa-la?",
                            type: "warning",
                            showCancelButton: true,                  
                            confirmButtonText: "Sim, eu desejo reativar!",
                            cancelButtonText:"Cancelar",
                            closeOnConfirm: false
                        },
                        function(){
                            var dataParams = new FormData();
                            dataParams.append('user_id',response.data.id);

                            LoginService.reactive(dataParams ,function(response){
                                if(response.status == "success"){
                                   swal("Reativado!", "Sua conta foi reativada com sucesso.", "success");             
                                }
                            });
                            
                        });
                        break;
                    case "Login ou senha inválidos":
                        $scope.password = true; 
                    break;
                    default:
                        alert("ocorreu um erro inesperado");
                }                  
             } 
        });

    };

}).service(
    'LoginService', [
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
        service.login = function(params,callback){
            service.req.url = $rootScope.urlRoute + "/User/Login";// params = email, password
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(data){
                if (typeof callback == 'function'){
                    callback(data.data);
                }
            });
        };
        service.reactive = function(params,callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/User/ReactivateAccount";// params = email, password
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(data){
                if (typeof callback === 'function'){
                    callback(data.data);
                }
            });
        }                      
    }
]);
