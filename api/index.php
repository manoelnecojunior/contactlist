<?php

use turim\Bootstrap;

define('__APP_ROOT__', __DIR__);
chdir(__APP_ROOT__);

include 'vendor\turim\autoloader.php';

turim\Autoloader::init([
    'turim' => __APP_ROOT__ . '/vendor/turim',
]);

$bootstrap = new Bootstrap();
$bootstrap->setRoutes([
    'api/{controller=index}/{action=index}' => 'app\controllers'
]);
$bootstrap->start();