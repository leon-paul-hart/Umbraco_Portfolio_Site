(function () {
    'use strict';

    function serverManager(overlayService, notificationsService, uSyncPublishService) {

        return {
            checkServer: checkServer,
            checkServerByUrl: checkServerByUrl,

            createLocalApiKeys: createLocalApiKeys,
            remoteSetup: remoteSetup,
            syncSettings: syncSettings
        };
   
        function checkServer(alias, showSuccessBar, callback) {
            uSyncPublishService.checkServer(alias)
                .then(function (result) {

                    if (showSuccessBar) {
                        notificationsService.success('Connected', 'Server connection setup');
                    }

                    if (callback) {
                        callback(result.data);
                    }
                }, function (error) {
                    notificationsService.error('error', error.data.exceptionMessage);
                    if (callback) {
                        callback(null);
                    }
                });
        }

        function checkServerByUrl(url, callback) {
            uSyncPublishService.checkServerUrl(url)
                .then(function (result) {
                    if (callback) {
                        callback(result.data);
                    }
                }, function (error) {
                    if (callback) {
                        callback({
                            Status: 'Error',
                            Message: error.data.ExceptionMessage
                        });
                    }
                });
        }

        function createLocalApiKeys() {
            var overlay = {
                title: 'Generate security keys',
                subtitle: 'Generate a required security id and key',
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'remote/setupkeys.html',
                isModal: true,
                showResult: false,
                busy: false,
                disableBackdropClick: true,
                disableEscapeKey: true,
                skipFormValidation: true,
                submitButtonLabel: 'Generate security key config',
                closeButtonLabel: 'Not now',
                submit: function (model) {
                    // create keys. 
                    uSyncPublishService.createKeys()
                        .then(function (result) {
                            model.result = result.data;
                            model.hideSubmitButton = true;
                            model.closeButtonLabel = 'Close';
                            model.showResult = true;
                        }, function (error) {
                            notificationsService.error('Error', 'Unable to setup server');
                            overlayService.close();
                        });
                },
                close: function () {
                    // save settings
                    overlayService.close();
                }
            };

            overlayService.open(overlay);
        }



        function remoteSetup(server, callback) {

            var overlay = {
                title: 'Setup ' + server.name,
                subtitle: 'Setup API connection to ' + server.url,
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'remote/remoteOverlay.html',
                server: server,
                isModal: true,
                busy: false,
                disableBackdropClick: true,
                disableEscKey: true,
                skipFormValidation: true,
                disableSubmitButton: true,
                submitButtonLabel: 'Continue',
                closeButtonLabel: 'Close',
                submit: function (model) {

                    // do the actual login stuff here.... 
                    model.busy = true;
                    disableSubmitButton: true,

                        uSyncPublishService.setupServer(model.server.alias, model.server.url, model.username, model.password)
                        .then(function (result) {
                                if (result.data.Success) {

                                    notificationsService.success('Success', result.data.message);

                                    overlayService.close();

                                    if (callback) {
                                        callback(result.data.success);
                                    }
                                }
                                else {
                                    model.busy = false;
                                    model.showError = true;
                                    model.error = result.data.message;
                                }
                            }, function (error) {
                                notificationsService.error('Error', 'Unable to setup server');
                                if (callback) {
                                    callback(false);
                                }
                                overlayService.close();
                            });

                },
                close: function () {
                    overlayService.close();
                }
            };

            overlayService.open(overlay);
        }


        function syncSettings(callback) {
            var overlay = {
                title: 'Sync Settings',
                subtitle: 'Syncronize publisher settings between servers',
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'remote/syncSetup.html',
                isModal: true,
                servers: [],
                busy: false,
                disableBackdropClick: true,
                disableEscKey: true,
                disableSubmitButton: true,
                skipFormValidation: true,
                submitButtonLabel: 'Syncronize',
                closeButtonLabel: 'Close',
                submit: function (model) {

                    // do the actual login stuff here.... 
                    model.busy = true;

                    if (model.servers.length > 0) {
                        uSyncPublishService.syncSettings(model.servers)
                            .then(function (result) {
                                overlayService.close();
                                if (callback) {
                                    callback(result.data.success);
                                }
                                if (result.data.success) {
                                    notificationsService.success('Success', 'Server settings synced');
                                }
                                else {
                                    notificationsService.warning('Sync Issue', 'One or more servers failed to sync - see browser console for details');
                                    console.warn('Sync Failures: ', result.data.servers);
                                }
                            }, function (error) {
                                notificationsService.error('Error', 'Unable to setup server');
                                console.error('sync error', error);
                                if (callback) { callback(false); }
                                overlayService.close();
                            });
                    }
                },
                close: function () {
                    overlayService.close();
                }
            };

            overlayService.open(overlay);

        }


    }

    angular.module('umbraco')
        .factory('uSyncPublishServerManager', serverManager);


})();