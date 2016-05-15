<?php
// ga api functions
require_once 'ga/getResults.php';
require_once 'jsonCachedGAResults.php';

$start = $_GET['start'];
$end = $_GET['end'];
$location = $_GET['location'];
$count = $_GET['count'];
$query = $_GET['query'];


// set defaults
isset($start) || $start = '2016-03-24';
isset($end) || $end = 'today';
isset($query) || $query = '';
isset($count) || $count = 'false';
$count = ($count === 'true');
// Google Analytics settings
$gaAccount = 'analytics@preciousplastics-1262.iam.gserviceaccount.com';
$gaKeyFile = './client_secrets.p12';
$gaProfile = '110350856'; //the precisouplastic profileid
switch ($query) {
  case 'location':
    $params = array('dimensions' => 'ga:latitude,ga:longitude,ga:countryIsoCode','max-results' => 10000);
    $cache = './cache/ga-api-cache-locations.json';
    break;
  case 'city':
    $params = array('dimensions' => 'ga:cityid','max-results' => 100000);
    $cache = './cache/ga-api-cache-city-count.json';
    break;
  case 'country':
    $params = array('dimensions' => 'ga:countryIsoCode','max-results' => 100000);
    $cache = './cache/ga-api-cache-country-count.json';
    break;
  default:
    $params = array('max-results' => 100000);
    $cache = false;
}

// Google Analytics settings
$gaAccount = 'analytics@preciousplastics-1262.iam.gserviceaccount.com';
$gaKeyFile = './client_secrets.p12';
$gaProfile = '110350856'; //the precisouplastic profileid

$gaQuery = array(  
  'profile' => $gaProfile,
  'start' => $start,
  'end' => $end,
  'params' => $params
);
// run the query

if (!$cache) {

  $gaResults = getResults($gaAccount, $gaKeyFile, $gaQuery);

} else {
  $gaResults = json_cached_ga_results($gaAccount, $gaKeyFile, $gaQuery, $cache);
}

$gaRows = $gaResults[rows];
?>

<?php if($count) { ?>
<?php if(isset ($_GET['callback'])) {
    echo $_GET['callback']. '(';
  }
?>{
  "query" : <?php echo json_encode($gaQuery); ?>,
  "results" : {
    "count" : <?php echo count($gaRows); ?>    
  }
}
<?php if(isset ($_GET['callback'])) {
    echo ');';
}
?>
<?php } else { ?>
<?php $gaColumns = $gaResults[columns];?>  
<?php if(isset ($_GET['callback'])) {
    echo $_GET['callback']. '(';
  }
?>
{
  "query" : <?php echo json_encode($gaQuery); ?>,
  "results" : {
    "itemsPerPage" : <?php echo json_encode($gaResults[itemsPerPage]); ?>,
    "columns" : <?php echo json_encode($gaColumns); ?>,
    "rows" : <?php echo json_encode($gaRows); ?>
  }
}  
<?php if(isset ($_GET['callback'])) {
    echo ');';
}
?>
<?php } ?>