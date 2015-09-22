Attempts
===

[x] setup a simple stream analytics job to stream the event hub events into a database
[x] found this article as a reference 
    -> http://connectedstuff.net/2014/11/06/building-an-iot-solution-with-azure-event-hubs-and-stream-analytics-part-3/


Conclusions
===

---Looks like there won't be an easy way to have this auto-generate table schema for me, or filter out differente events from different devices with different request JSON.  So I think I need to catch these requests myself and not use event hubs.---

Got this working!  Needed 3 event hubs, 3 different tables, and 3 stream processors.

