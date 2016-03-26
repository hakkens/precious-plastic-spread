<?php

require_once 'ga/getService.php';
require_once 'ga/getResults.php';

// settings
$service_account_email = 'analytics@preciousplastics-1262.iam.gserviceaccount.com';
$key_file_location = './client_secrets.p12';
//$profile = '110350856'; 
$profile = '63420626';

$gaQuery = array(  
  'profile' => $profile,
  'start' => '2016-03-24',
  'end' => 'today',
  'params' => array(
    'dimensions' => 'ga:latitude,ga:longitude'
  )    
);
  
$analytics = getService($service_account_email,$key_file_location );

$results = getResults($analytics, $gaQuery);
//
$headers = $results->getColumnHeaders();
print_r(json_encode($headers));

$rows = $results->getRows();
print_r(json_encode($rows));

?>
