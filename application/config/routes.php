<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$route['default_controller'] = 'grid';
$route['api/services_update/(:num)']['put'] = 'api/services_update/$1';

$route['api/services_delete/(:num)']['delete'] = 'api/services_delete/$1';

;
