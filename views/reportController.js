lockerweb.controller("CtrlReport", function($scope,ReportService,$rootScope,$state) {
	$scope.dataReport = {};
    

    $scope.reportAdd = function(){//bug_error, bug_text; 
        var dataParams = new FormData();
        dataParams.append('bug_error', $scope.dataReport.bug);
        dataParams.append('bug_text', $scope.dataReport.text);

        ReportService.addReport(dataParams, function(response){
            if(response.status == "success"){

                $scope.showAlert = function() {
                    swal({
                          title: "Enviado!",
                          type: "success",
                          confirmButtonText: "Ok",
                          confirmButtonColor: "#2a9fd5"
                    });
                    $state.go('channels');
                };
                $scope.showAlert();
            }else {

            }      
        });
    };
    
}).service(
    'ReportService', [
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
            service.addReport = function(params, callback){
                service.req.headers['Access-Token'] = $rootScope.token;
                service.req.url = $rootScope.urlRoute + "/Bug/Add";
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