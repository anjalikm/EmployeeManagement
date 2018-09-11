 function myfunction()
    {
        promise = longfunctionfirst().then(shortfunctionsecond);
    }
    function longfunctionfirst()
    {
        d = new $.Deferred();
        setTimeout('alert("first function finished");d.resolve()',3000);
        return d.promise()
    }
    function shortfunctionsecond()
    {
        d = new $.Deferred();
        setTimeout('alert("second function finished");d.resolve()',200);
        return d.promise()
    }

myfunction();