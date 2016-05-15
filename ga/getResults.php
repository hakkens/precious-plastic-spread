<?php
// ga api functions
require_once 'ga/getService.php';

function getResults($service_account_email, $key_file_location, $query) {  
  $analytics = getService($service_account_email,$key_file_location );
  // Calls the Core Reporting API and queries for the number of sessions
  $api_results = query($analytics, $query);
  $itemsPerPage = $api_results['itemsPerPage'];
  $totalResults = $api_results['totalResults'];
  $chunks = 1;
  
  $results = array (
    rows => $api_results->getRows(), 
    columns => $api_results->getColumnHeaders(),
    itemsPerPage => $api_results[itemsPerPage]      
  );
  
  while(($chunks * $itemsPerPage) < $totalResults ){
    
    $query['params']['start-index'] =  ($chunks * $itemsPerPage)+ 1;
    
    $api_results = query($analytics, $query);
    
    $results['rows'] = array_merge($results['rows'],$api_results->getRows());
    $chunks++;
  }
    
  return $results;
}

function query($analytics, $query){
  return $analytics->data_ga->get(
       'ga:' . $query['profile'],
       $query['start'],
       $query['end'],
       'ga:sessions',
       $query['params']
    );
}

?>