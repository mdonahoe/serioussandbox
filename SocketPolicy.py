#!/usr/bin/python
# 
# Simple Socket Server for Flash

print "SocketPolicy.py"
import sys
import asyncore, asynchat
import os, socket, string

PORT = 843
access_list = (
        ('www.rrrrthats5rs.com','43143'),
        ('*','7263')
        )
policies = ['<allow-access-from domain="%s" to-ports="%s" />' %access for access in access_list]
policy_file = '<cross-domain-policy>'+''.join(policies)+'</cross-domain-policy>'

class SOCKETChannel(asynchat.async_chat):
    listeners = []
 
    def __init__(self, server, sock, addr):
        asynchat.async_chat.__init__(self, sock)
        self.set_terminator("\n")
        self.data = ""
        SOCKETChannel.listeners.append(self)

    def handle_close(self) :
        SOCKETChannel.listeners.remove(self)
        asynchat.async_chat.handle_close(self)
        print "Connections remaining:"+str(len(SOCKETChannel.listeners))

    def __del__(self) :
        if self in SOCKETChannel.listeners :
            SOCKETChannel.listeners.remove(self)
 	
    def collect_incoming_data(self, data):
	if data.startswith('<policy-file-request/>'):
		print "giving policy..."
		print policy_file   
		self.push(policy_file+'\0')
	else:
		self.data = self.data + data
 
    def found_terminator(self):
        self.data = ''

class SOCKETServer(asyncore.dispatcher):
 
    def __init__(self, port):
        asyncore.dispatcher.__init__(self)
        self.create_socket(socket.AF_INET, socket.SOCK_STREAM)
        self.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        self.bind(("", port))
        self.listen(5)
        
    def handle_accept(self):
        conn, addr = self.accept()
        SOCKETChannel(self, conn, addr)
 
 
s = SOCKETServer(PORT)
print "Listening on port", PORT, "..."
try:
    asyncore.loop()
except KeyboardInterrupt:
    s.close()
