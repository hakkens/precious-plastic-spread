<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" lang=""> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" lang=""> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang=""> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="apple-touch-icon" href="apple-touch-icon.png">

        <link rel="stylesheet" href="css/normalize.min.css">
        <link rel="stylesheet" href="css/main.css">

        <script src="js/vendor/modernizr-2.8.3-respond-1.4.2.min.js"></script>
    </head>
    <body>
        <!--[if lt IE 8]>
            <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->
<?php
// ga api functions
require_once 'ga/getResults.php';

// Google Analytics settings
$gaAccount = 'analytics@preciousplastics-1262.iam.gserviceaccount.com';
$gaKeyFile = './client_secrets.p12';
//$profile = '110350856'; the precisouplastic profileid
$gaProfile = '63420626';
$gaQuery = array(  
  'profile' => $gaProfile,
  'start' => '2016-03-24',
  'end' => 'today',
  'params' => array('dimensions' => 'ga:latitude,ga:longitude')    
);
// run the query
$gaResults = getResults($gaAccount, $gaKeyFile, $gaQuery);

// print results
$gaColumns = $gaResults->getColumnHeaders();

$gaRows = $gaResults->getRows();

?>
    <script>
      var gaInteractions = {
        columns : <?php echo json_encode($gaColumns); ?>,
        rows : <?php echo json_encode($gaRows); ?>
      }
    </script>
    
  
  
  
    <div id="map"></div>
  
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.js"></script>
    <script>window.jQuery || document.write('<script src="js/vendor/jquery-1.11.2.js"><\/script>')</script>

    <script src="js/main.js"></script>    
  </body>
</html>
