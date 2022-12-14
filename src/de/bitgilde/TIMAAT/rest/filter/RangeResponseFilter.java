package de.bitgilde.TIMAAT.rest.filter;

import java.io.IOException;
import java.io.OutputStream;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response.Status;

/*
 Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

/**
 * A {@link ContainerResponseFilter} capable to handle ranged requests.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
public class RangeResponseFilter implements ContainerResponseFilter {

    private static final String ACCEPT_RANGES = "Accept-Ranges";

    private static final String BYTES_RANGE = "bytes";

    private static final String RANGE = "Range";

    private static final String IF_RANGE = "If-Range";

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {

    	// System.out.println("filter called");
        responseContext.getHeaders().add(ACCEPT_RANGES, BYTES_RANGE);

        if (!requestContext.getHeaders().containsKey(RANGE)) {
            return;
        } else if (requestContext.getHeaders().containsKey(IF_RANGE)) {
            String ifRangeHeader = requestContext.getHeaderString(IF_RANGE);
            if (responseContext.getHeaders().containsKey(HttpHeaders.ETAG)
                    && responseContext.getHeaderString(HttpHeaders.ETAG).equals(ifRangeHeader)) {
                this.applyFilter(requestContext, responseContext);
                return;
            }
            if (responseContext.getHeaders().containsKey(HttpHeaders.LAST_MODIFIED)
                    && responseContext.getHeaderString(HttpHeaders.LAST_MODIFIED).equals(ifRangeHeader)) {
                this.applyFilter(requestContext, responseContext);
                return;
            }
        } else {
            this.applyFilter(requestContext, responseContext);
        }
    }

    private void applyFilter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {

        String rangeHeader = requestContext.getHeaderString(RANGE);
        String contentType = responseContext.getMediaType().toString();
        OutputStream originOutputStream = responseContext.getEntityStream();
        RangedOutputStream rangedOutputStream = new RangedOutputStream(originOutputStream, rangeHeader, contentType,
                responseContext.getHeaders());
        responseContext.setStatus(Status.PARTIAL_CONTENT.getStatusCode());
        responseContext.setEntityStream(rangedOutputStream);

    }

}
