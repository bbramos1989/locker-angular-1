lockerweb.controller("CtrlTerm", function($state, $scope, $stateParams, $rootScope, MessageService, TermService, SQLService, ngAudio, Upload) { 
    $rootScope.currentId = $stateParams.id;
    $scope.lastTerm = function(){
        var dataParams = new FormData();      
        TermService.lastTerm(dataParams, function(response){ 
            console.log('entrei no serviço');            
            if(response.status == 'success'){                
                $scope.return = response;
                console.log($scope.return);
            }
        });
        
    };
    $scope.lastTerm(); 

    $scope.acceptedTerm = function(){        
        var dataParams = new FormData();        
        TermService.acceptedTerm(dataParams, function(response){            
            if(response.status == 'success'){
                swal("Termos aceito com sucesso", "Clique no botão para continuar!", "success");
                $state.go('channels');
            }
        });        
    };

    $scope.viewNewTerm = function(){
        var url = $state.go('termos');
        window.open(url,'_blank');
    };     
    
}).service(
    'TermService', [
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
        service.lastTerm = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Terms/BringLastTerm";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){ 
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.acceptedTerm = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Terms/AcceptTerm";
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