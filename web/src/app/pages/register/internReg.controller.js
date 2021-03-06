(function() {
    'use strict';

    angular.module('BlurAdmin.pages.register')
        .controller('internRegCtrl', internRegCtrl);

    /** @ngInject */
    function internRegCtrl($scope, $http, $state, $rootScope, toastr, printService) {

        $scope.data = {
            'generalInfo': {},
            'contactInfo': {},
            'eduInsInfo': {},
            'internshipInfo': {}
        };

        $scope.state = $state.current.name;

        $scope.submitform = function() {
            //crate new intern in DynamoDB
            $scope.createNewIntern($scope.data.generalInfo, $scope.data.contactInfo, $scope.data.eduInsInfo, $scope.data.internshipInfo);
            //create new Intern in Cognito DB
            $scope.signUp($scope.data.contactInfo.email, $scope.data.contactInfo.email, "99Xt@intern");

        };

        $scope.createNewIntern = function(generalInfo, contactInfo, eduInsInfo, internshipInfo) {

            // create json for store user dataEmail
            var data = {
                "id": contactInfo.email,
                "username": "new",
                "firstname": generalInfo.firstName,
                "fullname": generalInfo.fullName,
                "lastname": generalInfo.LastName,
                "mobile": contactInfo.mobile,
                "instInfo": eduInsInfo,
                "intshpInfo": internshipInfo,
                "tel": contactInfo.contactHome,
                "address": contactInfo.address,
                "nic": generalInfo.nic,
                "email": contactInfo.email,
                "startdate": convertDate(String(internshipInfo.startDate)),
                "enddate": convertDate(String(internshipInfo.endDate)),
                "projects": {}
            };

            var config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                }
            };
            $http.post('https://owy0cw6hf0.execute-api.us-east-1.amazonaws.com/dev/createUser', data, config)
                .then(function(response) {

                    printService.print(JSON.stringify(data));
                    printService.print(response);

                    if (response.data == "It worked!") {
                        toastr.success('Your information has been saved successfully!');
                    } else {
                        toastr.error(response.data);
                    }

                });
        };

        $scope.signUp = function(email, username, password) {

            AWSCognito.config.region = 'us-east-1'; //This is required to derive the endpoint

            var poolData = {
                UserPoolId: 'us-east-1_vivy8Tb0Q',
                ClientId: '1f4qsiknh7p3th045vf1tv2r4d'
            };

            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

            var attributeList = [];
            var attributes = [{Name: 'email', Value: email}, {Name: 'profile', Value:  '/'}, {Name:'name',value:'INTERN'}];
            _.each(attributes,function(attribute){
              attributeList.push(new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute));
            } );

/*
            var dataEmail = {
                Name: 'email',
                Value: email
            };

            var dataRole = {
                Name: 'name',
                Value: 'INTERN'
            };

            var dataProfile = {
                Name: 'profile',
                value: '/'
            };

            var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
            var attributeRole = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataRole);
            var attributeProfile = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataProfile);

            attributeList.push(attributeEmail);
            attributeList.push(attributeRole);
            attributeList.push(attributeProfile);
*/


            userPool.signUp(username, password, attributeList, null, function(err, result) {
                if (err) {
                    printService.print(err);
                    return;
                }
            });
        };
    }

    function convertDate(input) {
        var date = input.split(" ");

        var mnths = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Sep: "09",
            Oct: "10",
            Nov: "11",
            Dec: "12"
        };

        return [date[3], mnths[date[1]], date[2]].join("-");
    }
})();
