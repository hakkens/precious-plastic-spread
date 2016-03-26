<?php
// ga api functions
require_once 'ga/getService.php';

function getResults($service_account_email, $key_file_location, $query) {  
  $analytics = getService($service_account_email,$key_file_location );
  // Calls the Core Reporting API and queries for the number of sessions
  // for the last seven days.
   return $analytics->data_ga->get(
       'ga:' . $query['profile'],
       $query['start'],
       $query['end'],
       'ga:sessions',
       $query['params']
    );
}

?>