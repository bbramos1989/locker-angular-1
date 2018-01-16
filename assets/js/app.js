var lockerweb = angular.module("LockerWebApp", ['ui.router','uiCropper','ngFileUpload', 'ngAudio', 'ngSanitize','timer','angular.filter','angularMoment', 'ngEmoticons'])
.config(['$qProvider','$stateProvider','$urlRouterProvider', function($qProvider, $stateProvider, $urlRouterProvider, state){
     // $qProvider.errorOnUnhandledRejections(false);
     $stateProvider//
        .state('channels', {
            url:'/channels/:id?',
            cache: false,
            views:{
                'main':{
                    templateUrl : "views/channels.html",
                    controller: 'CtrlChannels'
                },
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }   
            }
        })        
        .state('contacts', {
            url:'/contacts/:id/:addGroup?/:addParticipe?',
            cache: false,
            views:{
                'main':{
                    templateUrl : "views/contacts.html",
                    controller: 'CtrlContacts'
                },
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }    
            }
        })        
        .state('messages', {
            url:'/messages/:id',
            cache: false,
            views:{
                 'main':{
                    templateUrl : "views/channels.html",
                    controller: 'CtrlChannels' 
                },
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }               
            }
        }) 
        .state('termo', {
            url:'/term',
            cache: false,
            views:{
                'login':{
                    templateUrl : "views/term.html",
                    controller: 'CtrlTerm' 
                }            
            }
        }) 
        .state('aceitartermo', {
            url:'/newterm',
            cache: false,
            views:{
                'login':{
                    templateUrl : "views/newterm.html",
                    controller: 'CtrlTerm' 
                }            
            }
        }) 
        .state('settings', {
            url:'/settings/:id?',
            cache: false,
            views:{
                 'main':{
                    templateUrl : "views/settings.html",
                    controller: 'CtrlChannels' 
                },  
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }                    
            }
        }) 
        .state('resetpassword', {
            url:'/resetpassword/:id?',
            cache: false,
            views:{
                 'main':{
                    templateUrl : "views/resetpassword.html",
                    controller: 'CtrlresetPassword' 
                },  
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }                    
            }
        })
        .state('report', {
            url:'/report/:id?',
            cache: false,
            views:{
                 'main':{
                    templateUrl : "views/report.html",
                    controller: 'CtrlReport' 
                },  
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }                    
            }
        })
        .state('profile', {
            url:'/profile/:id',
            cache: false,
            views:{
                 'main':{
                    templateUrl : "views/profile.html",
                    controller: 'CtrlProfile' 
                },  
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }                    
            }
        }) 
        .state('login', {
            url:'/login',
            cache: false,
            views:{
                 'login':{
                    templateUrl : "views/login.html",
                    controller: 'CtrlLogin'                     
                },                                 
            }
        })
        .state('recoverPassword', {
            url:'/recover',
            cache: false,
            views:{
                 'login':{
                    templateUrl : "views/recoverPassword.html",
                    controller: 'CtrlRecover'                     
                },                                 
            }
        })
        .state('activateuser', {
            url:'/activateuser/:user/:token',
            cache: false,
            views:{
                 'login':{
                    templateUrl : "views/confirmUser.html",
                    controller: 'CtrlConfirmUser'                     
                },                                 
            }
        })
        .state('newPassword', {
            url:'/newpassword/:user/:token',
            cache: false,
            views:{
                 'login':{
                    templateUrl : "views/newpassword.html",
                    controller: 'CtrlNewPassword'                     
                },                                 
            }
        })
        .state('register', {
            url:'/register',
            cache: false, 
            views:{
                 'login':{
                    templateUrl : "views/register.html",
                    controller: 'CtrlRegister'                   
                },                                 
            }
        })
        .state('app', {
            url:'/mobile',
            cache: false,
            views:{
                 'login':{
                    templateUrl : "views/appdownload.html",
                    controller: 'CtrlLogin' 
                },                                 
            }
        })
        .state('group', {
            url:'/group/:id',
            cache: false,
            views:{
                 'main':{
                    templateUrl : "views/group.html",
                    controller: 'CtrlGroup' 
                },  
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }                    
            }
        })
        .state('contactDetail', {
            url:'/contact/:id/:contactid',
            cache: false,
            views:{
                 'main':{
                    templateUrl : "views/contactDetail.html",
                    controller: 'CtrlContactDetail' 
                },  
                'messages':{
                    templateUrl : "views/messages.html",
                    controller: 'CtrlMessages'
                }                    
            }
        });
    $urlRouterProvider.otherwise('/login');
}]);
lockerweb.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown", function(e) {
            if(e.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'e': e});
                });
                e.preventDefault();
            }
        });
    };
});
lockerweb.directive('inputRestrictor', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            var pattern =  /[^0-9a-z._]*/g;
            function fromUser(text) {
                if (!text)
                    return text;

                var transformedInput = text.replace(pattern, '');
                if (transformedInput !== text) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                return transformedInput;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);
// lockerweb.directive('emojiInput', function ($timeout) {
//     return {
//         restrict: 'A',
//         require: 'ngModel',
//         link: function ($scope, $el, $attr, ngModel) {
//             $.emojiarea.path = 'src/componentes/jquery-emojiarea-master/packs/basic/images/';
           
//             var options = $scope.$eval($attr.emojiInput);
//             var $wysiwyg = $($el[0]).emojiarea(options);

//             $wysiwyg.on('change', function () {
//                 ngModel.$setViewValue($wysiwyg.val());
//                 $scope.$apply();
//             });

//             ngModel.$formatters.push(function (data) {
//                 // emojiarea doesn't have a proper destroy :( so we have to remove and rebuild
//                 $wysiwyg.siblings('.emoji-wysiwyg-editor, .emoji-button').remove();
//                 $timeout(function () {
//                     $wysiwyg.emojiarea(options);
//                 }, 0);
//                 return data;
//             });
//         }
//     };
// });
