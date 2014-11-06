#!/usr/bin/python
# 
# Simple Socket Server for Flash

print "FlashBang.py"
import sys
import asyncore, asynchat
import os, socket, string

PORT = 7263

class Banger(asynchat.async_chat):
    roster = {}
    connectors = []
    def __init__(self, server, sock, addr):
        print 'connection with '+str(addr)
        asynchat.async_chat.__init__(self, sock)
        self.set_terminator("\0")
        self.data = ""
        self.location = None
        Banger.connectors.append(self)
        

    def handle_close(self) :
        self.removeMe()
        asynchat.async_chat.handle_close(self)

    def __del__(self) :
		self.removeMe()
		print 'disconnecting '+str(self.addr)
		print "Active Rooms:"
		for name,attendees in Banger.roster.iteritems():
			print "   "+str(len(attendees))+" - "+name
    
    def removeMe(self):
    	if self.location:
    		l = Banger.roster.get(self.location,[])
    		if self in l:l.remove(self)
    		if len(l)==0: Banger.roster.pop(self.location,None)
    	else:
    		if self in Banger.connectors: Banger.connectors.remove(self)
    	
    	
    	"""
    	try: Banger.connectors.remove(self)
    	except ValueError: pass
        
        try: Banger.roster[self.location].remove(self)
        except KeyError, ValueError: pass
        """
        
    def collect_incoming_data(self, data):
        self.data = self.data + data
 
    def found_terminator(self):
        print self.data
        if self.location==None:
            Banger.roster[self.data] = Banger.roster.get(self.data,[])+[self]
            Banger.connectors.remove(self)
            self.location = self.data
        self.data = ''
        for b in Banger.roster[self.location]:
            if b!=self:b.push('!\0')
        
        
class SOCKETServer(asyncore.dispatcher):
 
    def __init__(self, port):
        asyncore.dispatcher.__init__(self)
        self.create_socket(socket.AF_INET, socket.SOCK_STREAM)
        self.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        self.bind(("", port))
        self.listen(5)
        
    def handle_accept(self):
        conn, addr = self.accept()
        Banger(self, conn, addr)
 
 
s = SOCKETServer(PORT)
print "Listening on port", PORT, "..."
try:
    asyncore.loop()
except KeyboardInterrupt:
    s.close()
