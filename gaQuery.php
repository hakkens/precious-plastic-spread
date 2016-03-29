<?php
// ga api functions
require_once 'ga/getResults.php';

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

switch ($query) {
  case 'location':
    $params = array('dimensions' => 'ga:latitude,ga:longitude,ga:countryIsoCode','max-results' => 100000);
    break;
  case 'city':
    $params = array('dimensions' => 'ga:cityid','max-results' => 100000);
    break;
  case 'country':
    $params = array('dimensions' => 'ga:countryIsoCode','max-results' => 100000);
    break;
  default:
    $params = array('max-results' => 100000);
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
$gaResults = getResults($gaAccount, $gaKeyFile, $gaQuery);

// print results
$gaRows = $gaResults->getRows();
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
<?php $gaColumns = $gaResults->getColumnHeaders();?>  
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