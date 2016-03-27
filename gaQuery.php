<?php
// ga api functions
require_once 'ga/getResults.php';

$start = $_GET['start'];
$end = $_GET['end'];



isset($start) || $start = '2016-03-24';
isset($end) || $end = 'today';

// Google Analytics settings
$gaAccount = 'analytics@preciousplastics-1262.iam.gserviceaccount.com';
$gaKeyFile = './client_secrets.p12';
$gaProfile = '110350856'; //the precisouplastic profileid

$gaQuery = array(  
  'profile' => $gaProfile,
  'start' => $start,
  'end' => $end,
  'params' => array('dimensions' => 'ga:latitude,ga:longitude','max-results' => 100000)    
);
// run the query
$gaResults = getResults($gaAccount, $gaKeyFile, $gaQuery);

// print results
$gaColumns = $gaResults->getColumnHeaders();

$gaRows = $gaResults->getRows();

?>
{
  "query" : <?php echo json_encode($gaQuery); ?>,
  "results" : {
    "itemsPerPage" : <?php echo json_encode($gaResults[itemsPerPage]); ?>,
    "columns" : <?php echo json_encode($gaColumns); ?>,
    "rows" : <?php echo json_encode($gaRows); ?>
  }
}
